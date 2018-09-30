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

	//侍女
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqBuyMaid{}, on_C2GW_ReqBuyMaid)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMergeMaid{}, on_C2GW_ReqMergeMaid)
	//货币
	this.msgparser.RegistProtoMsg(msg.C2GW_UploadTrueGold{}, on_C2GW_UploadTrueGold)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqPower{}, on_C2GW_ReqPower)
	//活动
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqTurnBrand{}, on_C2GW_ReqTurnBrand)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqLinkup{}, on_C2GW_ReqLinkup)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqOpenBox{}, on_C2GW_ReqOpenBox)
	//后宫
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqPalaceTakeBack{}, on_C2GW_ReqPalaceTakeBack)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMasterLevelup{}, on_C2GW_ReqMasterLevelup)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMaidUnlock{}, on_C2GW_ReqMaidUnlock)
	//御赐
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqPrepareTravel{}, on_C2GW_ReqPrepareTravel)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqCheckEvent{}, on_C2GW_ReqCheckEvent)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqTravelView{}, on_C2GW_ReqTravelView)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqEventBarrage{}, on_C2GW_ReqEventBarrage)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqSendEventBarrage{}, on_C2GW_ReqSendEventBarrage)
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

	user.maid.SynMaidShop(user)
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
//更新货币
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
func on_C2GW_ReqPower(session network.IBaseNetSession, message interface{}) {
	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}
	user.NotifyPower()
}
//翻牌子
func on_C2GW_ReqTurnBrand(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqTurnBrand)
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
	result, id := user.TurnBrand(tmsg.GetIds())
	send := &msg.GW2C_RetTurnBrand{}
	send.Result = pb.Uint32(result)
	send.Id = pb.Uint32(id)
	user.SendMsg(send)
}
//连连看
func on_C2GW_ReqLinkup(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqLinkup)
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
	gold := user.Linkup(tmsg.GetScore())
	send := &msg.GW2C_RetLinkup{}
	send.Gold = pb.Uint64(gold)
	user.SendMsg(send)
}
//开箱子
func on_C2GW_ReqOpenBox(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqOpenBox)
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
	result := user.OpenBox(tmsg.GetId(), tmsg.GetNum())
	send := &msg.GW2C_RetOpenBox{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}

//收取
func on_C2GW_ReqPalaceTakeBack(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqPalaceTakeBack)
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
	result, items, data := user.palace.TakeBack(user, tmsg.GetId())
	send := &msg.GW2C_RetPalaceTakeBack{}
	send.Result = pb.Uint32(result)
	send.Items = items
	send.Data = data
	user.SendMsg(send)
}

//升级后宫
func on_C2GW_ReqMasterLevelup(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqMasterLevelup)
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
	result, data := user.palace.Levelup(user, tmsg.GetId())
	send := &msg.GW2C_RetMasterLevelup{}
	send.Result = pb.Uint32(result)
	send.Data = data
	user.SendMsg(send)
}

//解锁宫女
func on_C2GW_ReqMaidUnlock(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqMaidUnlock)
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
	result, data := user.palace.UnlockMaid(user, tmsg.GetId(), tmsg.GetIndex())
	send := &msg.GW2C_RetMaidUnlock{}
	send.Result = pb.Uint32(result)
	send.Data = data
	user.SendMsg(send)
}
//上供
func on_C2GW_ReqPrepareTravel(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqPrepareTravel)
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
	result := user.travel.PrepareTravel(user, tmsg.GetItems())
	send := &msg.GW2C_AckPrepareTravel{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//查看事件
func on_C2GW_ReqCheckEvent(session network.IBaseNetSession, message interface{}) {
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
	result := user.travel.CheckEvent(user)
	send := &msg.GW2C_AckCheckEvent{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//界面变化
func on_C2GW_ReqTravelView(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqTravelView)
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
	result := user.travel.OpenTravelView(tmsg.GetOpen())
	send := &msg.GW2C_AckTravelView{}
	send.Open = pb.Bool(result)
	user.SendMsg(send)
}
//查询弹幕
func on_C2GW_ReqEventBarrage(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqEventBarrage)
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
	records := user.ReqEventBarrages(tmsg.GetEventid())
	send := &msg.GW2C_AckEventBarrage{}
	for _, v := range records {
		send.Barrages = append(send.Barrages, *pb.String(v))
	}
	user.SendMsg(send)
}
//发送弹幕
func on_C2GW_ReqSendEventBarrage(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqSendEventBarrage)
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
	result := user.SendEventBarrage(tmsg.GetEventid(), tmsg.GetBarrage())
	send := &msg.GW2C_AckSendEventBarrage{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
