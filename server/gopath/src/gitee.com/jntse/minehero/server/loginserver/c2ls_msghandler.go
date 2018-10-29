package main

import (
	"crypto/md5"
	"fmt"
	_ "math/rand"
	_ "reflect"
	"strings"
	_ "time"

	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/pbmsg"
	_ "github.com/go-redis/redis"
	pb "github.com/golang/protobuf/proto"
)

//func init() {
//	NewC2LSMsgHandler()
//}

type C2LSMsgHandler struct {
	msgparser *network.ProtoParser
}

func NewC2LSMsgHandler() *C2LSMsgHandler {
	handler := &C2LSMsgHandler{}
	handler.Init()
	return handler
}

func (this *C2LSMsgHandler) Init() {

	this.msgparser = network.NewProtoParser("C2LS_MsgParser", tbl.ProtoMsgIndexGenerator)
	if this.msgparser == nil {
		return
	}

	// 收
	this.msgparser.RegistProtoMsg(msg.C2L_ReqLogin{}, on_C2L_ReqLogin)
	this.msgparser.RegistProtoMsg(msg.C2L_ReqLoginWechat{}, on_C2L_ReqLoginWechat)
	this.msgparser.RegistProtoMsg(msg.C2L_ReqRegistAccount{}, on_C2L_ReqRegistAccount)
}

func newL2C_RetLogin(reason string, ip string, port int, key string) *msg.L2C_RetLogin {
	send := &msg.L2C_RetLogin{
		Result: pb.Int32(1),
		Reason: pb.String(reason),
		Gatehost: &msg.IpHost{
			Ip:   pb.String(ip),
			Port: pb.Int(port),
		},
		Verifykey: pb.String(key),
		Host:      pb.String(fmt.Sprintf("%s:%d", ip, port)),
	}
	if reason != "" {
		send.Result = pb.Int32(0)
	}
	return send
}

//on_C2L_ReqLoginWechat 微信小游戏登陆
func on_C2L_ReqLoginWechat(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2L_ReqLoginWechat)
	tm1 := util.CURTIMEUS()
	errcode, openid, face, nickname := "", tmsg.GetOpenid(), tmsg.GetFace(), tmsg.GetNickname()
	account, passwd, invitationcode := openid, "", tmsg.GetInvitationcode()
	switch {
	default:
		// 1. 多Gate时避免多客户端同时登陆
		// 2. 已经登陆上的账户，在对应的Gate中要验证是否重复登陆
		if account == "" {
			errcode = "账户空字符串或包含空格"
			break
		}

		//// 登陆验证
		//if errcode = Authenticate(session, account, passwd); errcode != "" {
		//	break
		//}

		// 微信小游戏注册
		if errcode = RegistAccountFromWechatMiniGame(account, passwd, invitationcode, nickname, face); errcode != "" {
			break
		}

		if Login().FindAuthenAccount(account) == true {
			errcode = "同时登陆多个账户"
			break
		}

		// TODO: 从Redis获取账户缓存Gate信息，实现快速登陆
		log.Info("账户[%s] 使用邀请码[%s] 登陆Login", account, invitationcode)
		if ok := QuickLogin(session, account); ok == true {
			return
		}

		// 挑选一个负载较低的agent
		agent := GateMgr().FindLowLoadGate()
		if agent == nil {
			errcode = "没有可用Gate"
			break
		}

		// 生成校验key，玩家简单信息发送到对应Gate,用于验证玩家登陆Gate合法
		now := util.CURTIMEMS()
		signbytes := []byte(fmt.Sprintf("<%d-%s>", now, account))
		md5array := md5.Sum(signbytes)
		md5bytes := []byte(md5array[:])
		md5string := fmt.Sprintf("%s_%x", account, md5bytes)

		sendmsg := &msg.L2GW_ReqRegistUser{
			Account:   pb.String(account),
			Expire:    pb.Int64(now + 10000), // 10秒
			Gatehost:  pb.String(agent.Host()),
			Sid:       pb.Int(session.Id()),
			Timestamp: pb.Int64(now),
			Verifykey: pb.String(md5string),
		}
		agent.SendMsg(sendmsg)
		Login().AddAuthenAccount(account, session) // 避免同时登陆
		tm5 := util.CURTIMEUS()

		log.Info("登陆验证通过，请求注册玩家到Gate sid[%d] account[%s] host[%s] 登陆耗时%dus", session.Id(), account, agent.Host(), tm5-tm1)
		return
	}

	if errcode != "" {
		log.Info("账户:[%s] sid[%d] 登陆失败[%s]", account, session.Id(), errcode)
		session.SendCmd(newL2C_RetLogin(errcode, "", 0, ""))
		session.Close()
	}
}

// 注册账户
func on_C2L_ReqRegistAccount(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2L_ReqRegistAccount)

	account, passwd, name, face := tmsg.GetAccount(), tmsg.GetPasswd(), tmsg.GetName(), tmsg.GetFace()
	errcode := RegistAccount(account, passwd, "", name, face, "")

	// 回复
	send := &msg.L2C_RetRegistAccount{
		Account: pb.String(account),
		Errcode: pb.String(errcode),
	}
	session.SendCmd(send)
}

// 请求登陆验证
func on_C2L_ReqLogin(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2L_ReqLogin)
	tm1 := util.CURTIMEUS()
	errcode, account, name, face, token := "", tmsg.GetAccount(), tmsg.GetNickname(), tmsg.GetFace(), tmsg.GetToken()
	switch {
	default:
		// 1. 多Gate时避免多客户端同时登陆
		// 2. 已经登陆上的账户，在对应的Gate中要验证是否重复登陆
		if account == "" || strings.Contains(account, " ") {
			errcode = "账户空字符串或包含空格"
			break
		}

		if Login().FindAuthenAccount(account) == true {
			errcode = "同时登陆多个账户"
			break
		}

		// 校验，不需要密码了
		//errcode = Authenticate(session, account, "", name, face)
		if CheckNewAccount(session, account, name, face, token) != "" {
			errcode = "检查新账户报错"
			break
		}

		// TODO: 从Redis获取账户缓存Gate信息，实现快速登陆
		log.Info("账户[%s]登陆Login token[%s]", account, token)
		if ok := QuickLogin(session, account); ok == true {
			return
		}

		// 挑选一个负载较低的agent
		agent := GateMgr().FindLowLoadGate()
		if agent == nil {
			errcode = "没有可用Gate"
			break
		}

		// 生成校验key，玩家简单信息发送到对应Gate,用于验证玩家登陆Gate合法
		now := util.CURTIMEMS()
		signbytes := []byte(fmt.Sprintf("<%d-%s>", now, account))
		md5array := md5.Sum(signbytes)
		md5bytes := []byte(md5array[:])
		md5string := fmt.Sprintf("%s_%x", account, md5bytes)

		sendmsg := &msg.L2GW_ReqRegistUser{
			Account:   pb.String(account),
			Expire:    pb.Int64(now + 10000), // 10秒
			Gatehost:  pb.String(agent.Host()),
			Sid:       pb.Int(session.Id()),
			Timestamp: pb.Int64(now),
			Verifykey: pb.String(md5string),
		}
		agent.SendMsg(sendmsg)
		Login().AddAuthenAccount(account, session) // 避免同时登陆
		tm5 := util.CURTIMEUS()
		log.Info("登陆验证通过，请求注册玩家到Gate sid[%d] account[%s] host[%s] 登陆耗时%dus", session.Id(), account, agent.Host(), tm5-tm1)
		return
	}

	if errcode != "" {
		log.Info("账户:[%s] sid[%d] 登陆报错[%s]", account, session.Id(), errcode)
		session.SendCmd(newL2C_RetLogin(errcode, "", 0, ""))
		session.Close()
	}
}
