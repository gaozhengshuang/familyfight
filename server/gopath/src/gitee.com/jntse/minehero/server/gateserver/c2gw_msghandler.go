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
	this.msgparser.RegistProtoMsg(msg.C2GW_UploadBigGold{}, on_C2GW_UploadBigGold)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMiniGameCoin{}, on_C2GW_ReqMiniGameCoin)
	//活动
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqTurnBrand{}, on_C2GW_ReqTurnBrand)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqLinkup{}, on_C2GW_ReqLinkup)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqOpenBox{}, on_C2GW_ReqOpenBox)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqTenSecond{}, on_C2GW_ReqTenSecond)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqKickAss{}, on_C2GW_ReqKickAss)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqAttackPalaceData{}, on_C2GW_ReqAttackPalaceData)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqAttackPalace{}, on_C2GW_ReqAttackPalace)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqGuessKingData{}, on_C2GW_ReqGuessKingData)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqGuessKing{}, on_C2GW_ReqGuessKing)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqLuckily{}, on_C2GW_ReqLuckily)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqTryst{}, on_C2GW_ReqTryst)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqShareMessage{}, on_C2GW_ReqShareMessage)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqSignin{}, on_C2GW_ReqSignin)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqDailyPower{}, on_C2GW_ReqDailyPower)
	//后宫
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqPalaceTakeBack{}, on_C2GW_ReqPalaceTakeBack)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMasterLevelup{}, on_C2GW_ReqMasterLevelup)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqMaidUnlock{}, on_C2GW_ReqMaidUnlock)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqPartLevelup{}, on_C2GW_ReqPartLevelup)
	//御赐
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqPrepareTravel{}, on_C2GW_ReqPrepareTravel)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqCheckEvent{}, on_C2GW_ReqCheckEvent)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqTravelView{}, on_C2GW_ReqTravelView)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqEventBarrage{}, on_C2GW_ReqEventBarrage)
	this.msgparser.RegistProtoMsg(msg.C2GW_ReqSendEventBarrage{}, on_C2GW_ReqSendEventBarrage)
	//引导
	this.msgparser.RegistProtoMsg(msg.C2GW_UpdateGuideData{}, on_C2GW_UpdateGuideData)
	this.msgparser.RegistProtoMsg(msg.C2GW_NotifyOpenLevel{}, on_C2GW_NotifyOpenLevel)
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
	send.Price = price
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
	send.Touchid = pb.String(tmsg.GetTouchid())
	send.Findid = pb.String(tmsg.GetFindid())
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
func on_C2GW_UploadBigGold(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_UploadBigGold)
	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}
	user.SetBigGold(tmsg.GetGolds())
}
func on_C2GW_ReqMiniGameCoin(session network.IBaseNetSession, message interface{}) {
	user := ExtractSessionUser(session)
	if user == nil {
		log.Fatal(fmt.Sprintf("sid:%d 没有绑定用户", session.Id()))
		session.Close()
		return
	}
	user.currency.SynMiniGameCoin()
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
	result, id, drop := user.TurnBrand(tmsg.GetIds(), tmsg.GetLevel())
	send := &msg.GW2C_RetTurnBrand{}
	send.Result = pb.Uint32(result)
	send.Id = pb.Uint32(id)
	send.Drop = drop
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
	result, gold := user.Linkup(tmsg.GetScore())
	send := &msg.GW2C_RetLinkup{}
	send.Result = pb.Uint32(result)
	send.Gold = gold
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
//十秒小游戏
func on_C2GW_ReqTenSecond(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqTenSecond)
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
	result := user.TenSecond(tmsg.GetHit())
	send := &msg.GW2C_AckTenSecond{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//踢屁股
func on_C2GW_ReqKickAss(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqKickAss)
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
	result := user.KickAss(tmsg.GetHit())
	send := &msg.GW2C_AckKickAss{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//获得后宫目标
func on_C2GW_ReqAttackPalaceData(session network.IBaseNetSession, message interface{}) {
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
	send := user.ReqAttackData()
	user.SendMsg(send)
}
//攻击后宫
func on_C2GW_ReqAttackPalace(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqAttackPalace)
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
	user.AttackPalace(tmsg.GetId())
	send := &msg.GW2C_AckAttackPalace{}
	send.Result = pb.Uint32(0)
	user.SendMsg(send)
}
//获取猜皇帝数据
func on_C2GW_ReqGuessKingData(session network.IBaseNetSession, message interface{}) {
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
	send := user.ReqGuessKingData()
	user.SendMsg(send)
}
//猜皇帝
func on_C2GW_ReqGuessKing(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqGuessKing)
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
	result, index := user.GuessKing(tmsg.GetId(), tmsg.GetIndex())
	send := &msg.GW2C_AckGuessKing{}
	send.Result = pb.Uint32(result)
	send.Index = pb.Uint32(index)
	send.Hit = pb.Bool(index == tmsg.GetIndex())
	user.SendMsg(send)
}
//临幸
func on_C2GW_ReqLuckily(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqLuckily)
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
	result := user.ReqLuckily(tmsg.GetPalaceid())
	send := &msg.GW2C_AckLuckily{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//约会
func on_C2GW_ReqTryst(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqTryst)
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
	result := user.ReqTryst(tmsg.GetPalaceid(), tmsg.GetKey())
	send := &msg.GW2C_AckTryst{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//分享
func on_C2GW_ReqShareMessage(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqShareMessage)
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
	result, reward := user.share.Share(tmsg.GetSharetype(), tmsg.GetId(), tmsg.GetTime())
	send := &msg.GW2C_AckShareMessage{}
	send.Result = pb.Uint32(result)
	send.Reward = pb.Bool(reward)
	user.SendMsg(send)
}
//签到 
func on_C2GW_ReqSignin(session network.IBaseNetSession, message interface{}) {
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
	result := user.active.Signin()
	send := &msg.GW2C_AckSignin{}
	send.Result = pb.Uint32(result)
	user.SendMsg(send)
}
//每日体力
func on_C2GW_ReqDailyPower(session network.IBaseNetSession, message interface{}) {
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
	result := user.active.DailyPower()
	send := &msg.GW2C_AckDailyPower{}
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
	result, items, data, gold := user.palace.TakeBack(user, tmsg.GetId())
	send := &msg.GW2C_RetPalaceTakeBack{}
	send.Result = pb.Uint32(result)
	send.Items = items
	send.Data = data
	send.Gold = gold
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
//升级配件
func on_C2GW_ReqPartLevelup(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_ReqPartLevelup)
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
	result, data := user.palace.PartLevelup(user, tmsg.GetId(), tmsg.GetIndex())
	send := &msg.GW2C_AckPartLevelup{}
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
//更新引导
func on_C2GW_UpdateGuideData(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_UpdateGuideData)
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
	nextid := user.guide.UpdateGuide(user, tmsg.GetGuide())
	send := &msg.GW2C_AckGuideData{ Guide: pb.Uint32(nextid) }
	user.SendMsg(send)
}
//开启新关卡
func on_C2GW_NotifyOpenLevel(session network.IBaseNetSession, message interface{}) {
	tmsg := message.(*msg.C2GW_NotifyOpenLevel)
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
	nextid := user.guide.OpenNewLevel(user, tmsg.GetLevel())
	if nextid != 0 {
		send := &msg.GW2C_AckGuideData{ Guide: pb.Uint32(nextid) }
		user.SendMsg(send)
	}
}
