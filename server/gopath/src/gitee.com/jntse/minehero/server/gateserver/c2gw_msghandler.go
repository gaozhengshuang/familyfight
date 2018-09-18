package main
import (
	"fmt"
	_"reflect"
	_"strconv"
	_"encoding/json"
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/gogo/protobuf/proto"
	_"github.com/go-redis/redis"
	"gitee.com/jntse/minehero/server/tbl"
	_"gitee.com/jntse/minehero/server/def"
)


//func init() {
//	log.Info("msg_msghandler.init")
//	NewC2GWMsgHandler()
//}

// 提取Session User指针
func ExtractSessionUser(session network.IBaseNetSession) *GateUser {
	user, ok := session.UserDefData().(*GateUser)
	if ok == false {
		log.Fatal("网络会话Sid[%d]中没有绑定User指针", session.Id())
		return nil
	}
	return user
}


type C2GWMsgHandler struct {
	msgparser *network.ProtoParser
}

func NewC2GWMsgHandler() *C2GWMsgHandler {
	handler := &C2GWMsgHandler{}
	handler.Init()
	return handler
}

func (this* C2GWMsgHandler) Init() {

	this.msgparser = network.NewProtoParser("C2GW_MsgParser", tbl.ProtoMsgIndexGenerator)
	if this.msgparser == nil {
		return
	}

	// 收
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqLogin{}, on_C2GW_ReqLogin)
	this.msgparser.RegistProtoMsg(msg.C2GW_HeartBeat{}, on_C2GW_HeartBeat)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqDeliveryDiamond{}, on_C2GW_ReqDeliveryDiamond)

	// 发
	this.msgparser.RegistSendProto(msg.GW2C_HeartBeat{})
	this.msgparser.RegistSendProto(msg.GW2C_MsgNotice{})
	this.msgparser.RegistSendProto(msg.GW2C_MsgNotify{})
	this.msgparser.RegistSendProto(msg.GW2C_RetLogin{})
	this.msgparser.RegistSendProto(msg.GW2C_SendUserInfo{})
	this.msgparser.RegistSendProto(msg.GW2C_RetStartGame{})
	this.msgparser.RegistSendProto(msg.GW2C_AddPackageItem{})
	this.msgparser.RegistSendProto(msg.GW2C_RemovePackageItem{})
	this.msgparser.RegistSendProto(msg.GW2C_UpdateYuanbao{})
	this.msgparser.RegistSendProto(msg.GW2C_UpdateCoupon{})
	this.msgparser.RegistSendProto(msg.GW2C_UpdateGold{})
	this.msgparser.RegistSendProto(msg.GW2C_Ret7DayReward{})
	this.msgparser.RegistSendProto(msg.Sync_BigRewardPickNum{})
	this.msgparser.RegistSendProto(msg.GW2C_RetRechargeMoney{})
	this.msgparser.RegistSendProto(msg.GW2C_UpdateFreeStep{})
	this.msgparser.RegistSendProto(msg.GW2C_SendUserPlatformMoney{})
	this.msgparser.RegistSendProto(msg.GW2C_RetDeliveryDiamond{})

	this.msgparser.RegistSendProto(msg.GW2C_SendWechatInfo{})
	this.msgparser.RegistSendProto(msg.GW2C_LuckyDrawHit{})
	this.msgparser.RegistSendProto(msg.GW2C_SendDeliveryAddressList{})
	this.msgparser.RegistSendProto(msg.GW2C_FreePresentNotify{})

	// Room
	this.msgparser.RegistSendProto(msg.BT_GameInit{})
	this.msgparser.RegistSendProto(msg.BT_SendBattleUser{})
	this.msgparser.RegistSendProto(msg.BT_GameStart{})
	this.msgparser.RegistSendProto(msg.BT_GameOver{})
	this.msgparser.RegistSendProto(msg.BT_PickItem{})

	//侍女
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqBuyMaid{}, on_C2GW_ReqBuyMaid)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMergeMaid{}, on_C2GW_ReqMergeMaid)

	this.msgparser.RegistSendProto(msg.GW2C_AckMaids{})
	this.msgparser.RegistSendProto(msg.GW2C_AckMaidShop{})
	this.msgparser.RegistSendProto(msg.GW2C_AckBuyMaid{})
	this.msgparser.RegistSendProto(msg.GW2C_AckMergeMaid{})
	//货币
	this.msgparser.RegistProtoMsg(msg.C2GW_UploadTrueGold{}, on_C2GW_UploadTrueGold)
	this.msgparser.RegistSendProto(msg.GW2C_UpdateTrueGold{})
	this.msgparser.RegistSendProto(msg.GW2C_OfflineReward{})
	this.msgparser.RegistSendProto(msg.GW2C_UpdatePower{})
}

// 客户端心跳
func on_C2GW_HeartBeat(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_HeartBeat)
	//log.Info(reflect.TypeOf(tmsg).String())

	//account, ok := session.UserDefData().(string)
	//if ok == false {
	//	session.Close()
	//	return
	//}

	//user := UserMgr().FindByAccount(account)
	//if user == nil {
	//	log.Error("收到账户[%s]心跳，但玩家不在线", account)
	//	return
	//}

	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}
	user.SetHeartBeat(util.CURTIMEMS())

	//curtime := util.CURTIMEUS()
	//log.Info("receive heart beat msg interval=%d", curtime - tmsg.GetTime())
	session.SendCmd(&msg.GW2C_HeartBeat{
		Uid: tmsg.Uid,
		Time: pb.Int64(util.CURTIMEUS()),
		Test: tmsg.Test,
	})
}

func on_C2GW_ReqLogin(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqLogin)
	reason, account, verifykey, token , face := "", tmsg.GetAccount(), tmsg.GetVerifykey(), tmsg.GetToken(), tmsg.GetFace()
	islogin := false

	switch {
	default:
		if UserMgr().FindByAccount(account) != nil {
			islogin, reason = true, "玩家已经登陆了"
			log.Info("账户%s 登录Gate失败，已经登陆了", account)
			break
		}

		wAccount := WaitPool().Find(account)
		if wAccount == nil {
			reason = "非法登陆网关"
			//log.Info("账户%s 登录Gate失败，没有注册信息", account)
			break
		}

		if wAccount.verifykey != verifykey {
			reason = "登陆网关校验失败"
			log.Info("账户%s 登陆Gate校验Key不正确 want:%s have:%s", account, wAccount.verifykey, verifykey)
			break
		}

		// 构造新GateUser
		user, newerr := UserMgr().CreateNewUser(session, account, verifykey, token, face)
		if newerr != "" || user == nil {
			reason = newerr
			log.Info("账户%s 创建新GateUser失败 原因[%s]", account, newerr)
			break
		}

		session.SetUserDefData(user)		// TODO: 登陆成功才绑定账户到会话
		return
	}

	// 返回给客户端，失败才回
	if reason != "" {
		if !islogin { UnBindingAccountGateWay(account) }
		log.Error("sid[%d] 账户[%s] 登陆网关失败 reason[%s]", session.Id(), account, reason)
		send := &msg.GW2C_RetLogin{ Errcode : pb.String(reason) }
		session.SendCmd(send)
		session.Close() 
	}
}

func on_C2GW_ReqDeliveryGoods(session network.IBaseNetSession, message interface{}) {
	//tmsg := message.(*msg.C2GW_ReqDeliveryGoods)

	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}

	if user.IsOnline() == false {
		log.Error("玩家[%s %d] 没有登陆Gate成功", user.Name(), user.Id())
		session.Close()
		return
	}

	// 发货
	if tbl.Global.IntranetFlag {
		user.SendNotify("本版本暂不可用")
		return
	}else {
		//event := NewDeliveryGoodsEvent(tmsg.GetList(), tmsg.GetToken(), user.DeliveryGoods)
		//user.AsynEventInsert(event)
	}
}

func on_C2GW_ReqDeliveryDiamond(session network.IBaseNetSession, message interface{}) {
	//tmsg := message.(*msg.C2GW_ReqDeliveryDiamond)

	//user := ExtractSessionUser(session)
	//if user == nil {
	//	log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
	//	session.Close()
	//	return
	//}

	//if user.IsOnline() == false {
	//	log.Error("玩家[%s %d]没有登陆Gate成功", user.Name(), user.Id())
	//	session.Close()
	//	return
	//}

	//// 提钻石
	//if tbl.Global.IntranetFlag {
	//	user.SendNotify("本版本暂不可用")
	//	return
	//}else {
	//	event := NewDeliveryGoodsEvent(tmsg.GetList(), tmsg.GetToken(), user.DeliveryDiamond)
	//	user.AsynEventInsert(event)
	//}
}

//====================================== 侍女
//购买
func on_C2GW_ReqBuyMaid(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqBuyMaid)
	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}

	if user.IsOnline() == false {
		log.Error("玩家[%s %d] 没有登陆Gate成功", user.Name(), user.Id())
		session.Close()
		return
	}
	send := &msg.GW2C_AckBuyMaid{}
	result,addition,price := user.maid.BuyMaid(user,tmsg.GetMaidid())
	if result == 0 && addition != nil {
		updateSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
		updateSend.Datas = append(updateSend.Datas, addition.PackBin())
		updateSend.Maxid = pb.Uint32(user.maid.GetMaxId())
		user.SendMsg(updateSend)
	}
	send.Result = pb.Uint32(result)
	send.Price = pb.Uint64(price)
	user.SendMsg(send)
}
//合并
func on_C2GW_ReqMergeMaid(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqMergeMaid)
	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}

	if user.IsOnline() == false {
		log.Error("玩家[%s %d] 没有登陆Gate成功", user.Name(), user.Id())
		session.Close()
		return
	}
	send := &msg.GW2C_AckMergeMaid{}
	result,removed,addition := user.maid.MergeMaid(user,tmsg.GetMaidid())
	if result == 0{
		updateSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
		if removed != nil {
			updateSend.Datas = append(updateSend.Datas, removed.PackBin())
		}
		if addition != nil {
			updateSend.Datas = append(updateSend.Datas, addition.PackBin())
		}
		updateSend.Maxid = pb.Uint32(user.maid.GetMaxId())
		user.SendMsg(updateSend)
	}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}

func on_C2GW_UploadTrueGold(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_UploadTrueGold)
	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}

	if user.IsOnline() == false {
		log.Error("玩家[%s %d] 没有登陆Gate成功", user.Name(), user.Id())
		session.Close()
		return
	}
	user.SetGold(tmsg.GetNum())
}
