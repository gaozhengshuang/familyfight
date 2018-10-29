package main

import (
	"fmt"

	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/redis"
	_ "gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/server/def"
	"gitee.com/jntse/minehero/server/tbl"
	"github.com/go-redis/redis"
	pb "github.com/golang/protobuf/proto"
)

type ClientAccount struct {
	session  network.IBaseNetSession
	account  string
	tm_login int64
}

// 查找账户绑定Gate
func FindAccountGateWay(account string) (*msg.AccountGateInfo, error) {
	info := &msg.AccountGateInfo{}
	key := fmt.Sprintf("%s_%s", def.RedisKeyAccountGate, account)
	err := utredis.GetProtoBin(Redis(), key, info)
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	ip, port := info.GetIp(), int(info.GetPort())
	if GateMgr().IsRegisted(ip, port) == false {
		log.Error("账户%s 存储的网关host %s:%d 不可用", account, ip, port)
		return nil, nil
	}

	return info, nil
}

// 绑定账户一个Gate
func BindingAccountGateWay(account string, ip string, port int, vkey string) error {
	key := fmt.Sprintf("%s_%s", def.RedisKeyAccountGate, account)
	info := &msg.AccountGateInfo{Ip: pb.String(ip), Port: pb.Int(port), Verifykey: pb.String(vkey)}
	if err := utredis.SetProtoBin(Redis(), key, info); err != nil {
		return err
	}
	err := InsertAccountToGate(account, ip, port)
	return err
}

// 移除账户和Gate的绑定关系
func UnBindingAccountGateWay(account string) error {
	key := fmt.Sprintf("%s_%s", def.RedisKeyAccountGate, account)
	err := Redis().Del(key).Err()
	return err
}

// 插入账户到Gate
func InsertAccountToGate(account string, ip string, port int) error {
	key := fmt.Sprintf("%s_%s:%d", def.RedisKeyGateAccounts, ip, port)
	err := Redis().SAdd(key, account).Err()
	return err
}

// 从Gate查找账户
func IsFindAccountFromGate(account string, ip string, port int) (bool, error) {
	key := fmt.Sprintf("%s_%s:%d", def.RedisKeyGateAccounts, ip, port)
	ok, err := Redis().SIsMember(key, account).Result()
	if err != nil {
		return false, err
	}
	return ok, nil
}

func AmountGateAccount(ip string, port int) int64 {
	key := fmt.Sprintf("%s_%s:%d", def.RedisKeyGateAccounts, ip, port)
	num, err := Redis().SCard(key).Result()
	if err != nil {
		return 0
	}
	return num
}

//// 从Gate移除账户
//func RemoveAccountsFromGate(account string, ip string, port int) error {
//	key := fmt.Sprintf("%s_%s:%d", def.RedisKeyGateAccounts, ip, port)
//	err := Redis().SRem(key, account).Err()
//	return err
//}
//
//// 清除Gate上的账户信息
//func ClearGateAccounts(ip string, port int) error {
//	key := fmt.Sprintf("%s_%s:%d", def.RedisKeyGateAccounts, ip, port)
//	err := Redis().Del(key).Err()
//	return err
//}

func QuickLogin(session network.IBaseNetSession, account string) bool {
	host, err := FindAccountGateWay(account)
	if err != nil && err != redis.Nil {
		log.Error("账户%s Find Account GateWay 报错err: %v", account, err)
		return false
	}

	if host == nil {
		return false
	}

	// 检查Gate是否存在
	ip, port, vkey := host.GetIp(), int(host.GetPort()), host.GetVerifykey()
	if GateMgr().IsRegisted(ip, port) == false {
		return false
	}

	// 检查Gate上是否清除了玩家信息，例如Gate重启过
	isfind, err := IsFindAccountFromGate(account, ip, port)
	if err != nil {
		log.Error("账户%s Is Find Account FromGate 报错err: %s", account, err)
		return false
	}

	// 解除绑定Account上的Gateway信息，使用普通登陆
	if isfind == false {
		UnBindingAccountGateWay(account)
		//RemoveAccountsFromGate(account, ip, port)
		return false
	}

	log.Info("账户[%s] 快速登陆Gate[ip:%s port:%d]", account, ip, port)
	session.SendCmd(newL2C_RetLogin("", ip, port, vkey))
	Login().AddAuthenAccount(account, session) // 避免同时登陆
	return true
}

// --------------------------------------------------------------------------
/// @brief 账户校验
/// @return
// --------------------------------------------------------------------------
//func Authenticate(session network.IBaseNetSession, account string, passwd string, name string, face string) (string) {
//
//	// 获取账户信息
//	accountinfo, key := &msg.AccountInfo{}, fmt.Sprintf("accounts_%s", account)
//	if err := utredis.GetProtoBin(Redis(), key, accountinfo); err != nil {
//		log.Info("账户数据不存在，err: %s", err)		// 不存在的账户
//		return "账户数据不存在"
//	}
//
//	// 验证账户
//	//if passwd != accountinfo.GetPasswd() {
//	//	log.Info("账户[%s]玩家登陆验证失败，密码错误", account)
//	//	session.SendCmd(newL2C_RetLogin("密码错误", "", 0, ""))
//	//	return fmt.Errorf("密码错误");
//	//}
//
//	return ""
//}

// 检查新账户
func CheckNewAccount(session network.IBaseNetSession, account, name, face, token string) string {
	// 获取账户信息
	key := "accounts_" + account
	exist, err := Redis().Exists(key).Result()
	if err != nil {
		return "登陆检查账户是否存在"
	}

	if exist == 1 {
		return ""
	}

	log.Info("注册新账户[%s]", account) // 不存在的账户
	if errcode := RegistAccount(account, "", "", name, "", token); errcode != "" {
		return fmt.Sprintf("注册账户失败 账户[%s] 错误[%s]", account, errcode)
	}

	return ""
}

// 微信小游戏，直接注册账户
func RegistAccountFromWechatMiniGame(account, passwd, invitationcode, name, face string) string {
	if account == "" {
		return "账户不能为空"
	}

	// 获取账户信息
	key := fmt.Sprintf("accounts_%s", account)
	exist, err := Redis().Exists(key).Result()
	if err != nil {
		return "检查账户存在 Redis报错"
	}

	if exist == 1 {
		return ""
	}

	if errcode := RegistAccount(account, passwd, invitationcode, name, face, account); errcode != "" {
		return fmt.Sprintf("注册账户失败 账户[%s] 错误[%s]", account, errcode)
	}

	return ""
}

// --------------------------------------------------------------------------
/// @brief 注册账户
///
/// @param account 账户名
/// @param passwd 密码
/// @param invitationcode 邀请码
/// @param
///
/// @return
// --------------------------------------------------------------------------
func RegistAccount(account, passwd, invitationcode, name, face, token string) (errcode string) {
	errcode = ""
	switch {
	default:

		// 账户检查重复
		key := fmt.Sprintf("accounts_%s", account)
		bexist, err := Redis().Exists(key).Result()
		if err != nil {
			errcode = "redis暂时不可用"
			log.Error("检查账户是否存在 Redis错误:%s", err)
			break
		}

		if bexist == 1 {
			errcode = "账户已经存在"
			break
		}

		// 实名认证
		// 生成唯一userid
		userid, errstr := GenerateUserId()
		if errstr != "" {
			errcode = errstr
			break
		}

		// 新建账户
		info := &msg.AccountInfo{
			Account: &account,
			Passwd:  &passwd,
			Userid:  pb.Uint64(userid),
		}

		if err := utredis.SetProtoBin(Redis(), key, info); err != nil {
			errcode = "插入账户数据失败"
			log.Error("新建账户%s失败，err: %s", account, err)
			break
		}

		// 初始元宝和金卷
		Yuanbao, Coupon := uint32(tbl.Global.Newuser.Yuanbao), uint32(tbl.Global.Newuser.Coupon)
		userinfo := &msg.Serialize{
			Entity: &msg.EntityBase{Id: pb.Uint64(userid), Name: pb.String(name), Face: pb.String(face), Account: pb.String(account)},
			Base:   &msg.UserBase{Money: pb.Uint32(0), Coupon: pb.Uint32(Coupon), Yuanbao: pb.Uint32(Yuanbao), Level: pb.Uint32(1), Gold: pb.Uint64(0)},
			Item:   nil,
			//Item : &msg.ItemBin{Items:make([]*msg.ItemData,0)},
		}
		//Item , Pos := userinfo.GetItem(), int32(msg.ItemPos_Bag)
		//Item.Items = append(Item.Items, &msg.ItemData{Id:pb.Uint32(101),Num:pb.Uint32(10), Pos:pb.Int32(Pos)})
		//Item.Items = append(Item.Items, &msg.ItemData{Id:pb.Uint32(102),Num:pb.Uint32(20), Pos:pb.Int32(Pos)})
		userkey := fmt.Sprintf("userbin_%d", userid)
		//log.Info("userinfo=%v",userinfo)
		if err := utredis.SetProtoBin(Redis(), userkey, userinfo); err != nil {
			errcode = "插入玩家数据失败"
			log.Error("新建账户%s插入玩家数据失败，err: %s", account, err)
			break
		}

		arglist := []interface{}{account, token, name, uint64(userid)}
		event := eventque.NewCommonEvent(arglist, def.HttpRequestNewUserArglist, nil)
		Login().AsynEventInsert(event)
		log.Info("账户[%s] UserId[%d] 名字[%s] 创建新用户成功", account, userid, name)
	}

	if errcode != "" {
		log.Info("账户[%s] 创建新用户失败 err[%s]", account, errcode)
	}

	return errcode
}
