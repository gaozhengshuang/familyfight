package main

import (
	"fmt"
	"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/gotoolkit/redis"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/def"
	"gitee.com/jntse/minehero/server/tbl"
	pb "github.com/golang/protobuf/proto"
	//"gitee.com/jntse/minehero/server/def"
	_ "github.com/go-redis/redis"
	_ "strconv"
	_ "strings"
	_ "time"
)

// --------------------------------------------------------------------------
/// @brief db数据管理
// --------------------------------------------------------------------------
type DBUserData struct {
	bin           *msg.Serialize // db二进制数据
	tm_login      int64
	tm_logout     int64
	money         uint32
	coupon        uint32
	yuanbao       uint32
	level         uint32
	exp           uint32
	continuelogin uint32
	nocountlogin  uint32
	signreward    uint32
	signtime      uint32
	addrlist      []*msg.UserAddress
	gold 		  uint64
	power 		  uint32 
	nextpowertime uint64
	maxpower 	  uint32
}

type BoxData struct {
	id			  uint32
	num 		  uint32
	level		  uint32
	generatetime  uint64
}

func (this *BoxData) PackBin() *msg.BoxData{
	data := &msg.BoxData{}
	data.Id = pb.Uint32(this.id)
	data.Num = pb.Uint32(this.num)
	data.Level = pb.Uint32(this.level)
	data.Generatetime = pb.Uint64(this.generatetime)
	return data
}
// --------------------------------------------------------------------------
/// @brief 玩家
// --------------------------------------------------------------------------
type GateUser struct {
	DBUserData
	client        network.IBaseNetSession
	account       string
	verifykey     string
	online        bool
	tickers       UserTicker
	bag           UserBag // 背包
	maid 		  UserMaid
	palace 		  UserPalace
	travel 		  UserTravel
	boxs 		  map[uint32]*BoxData
	tm_disconnect int64
	tm_heartbeat  int64                   // 心跳时间
	tm_asynsave   int64                   // 异步存盘超时
	savedone      bool                    // 存盘标记
	cleanup       bool                    // 清理标记
	token         string                  // token
	asynev        eventque.AsynEventQueue // 异步事件处理
	fbitemmap     map[int32]int32
	deliverystate bool   // 发货状态
    roomid        int64
	gameflag      bool
	guide		  uint32
}

func NewGateUser(account, key, token string) *GateUser {
	u := &GateUser{account: account, verifykey: key}
	u.bag.Init(u)
	u.maid.Init()
	u.palace.Init()
	u.travel.Init()
	u.tickers.Init(u.OnTicker10ms, u.OnTicker100ms, u.OnTicker1s, u.OnTicker5s, u.OnTicker1m)
	u.cleanup = false
	u.tm_disconnect = 0
	u.continuelogin = 1
	u.tm_asynsave = 0
	u.savedone = false
	u.token = token
    u.roomid = 0
	u.gameflag = false
	u.guide = 0
	return u
}

func (this *GateUser) Account() string {
	return this.account
}

func (this *GateUser) EntityBase() *msg.EntityBase {
	return this.bin.GetEntity()
}

func (this *GateUser) UserBase() *msg.UserBase {
	return this.bin.GetBase()
}

func (this *GateUser) Name() string {
	return this.EntityBase().GetName()
}

func (this *GateUser) Id() uint64 {
	return this.EntityBase().GetId()
}

func (this *GateUser) Face() string {
	return this.EntityBase().GetFace()
}

func (this *GateUser) SetFace(f string) {
	this.EntityBase().Face = pb.String(f)
}

func (this *GateUser) Sid() int {
	if this.client != nil {
		return this.client.Id()
	}
	return 0
}

func (this *GateUser) Level() uint32 {
	return this.level
}

func (this *GateUser) Exp() uint32 {
	return this.exp
}

func (this *GateUser) Token() string {
	return this.token
}

func (this *GateUser) SetToken(t string) {
	this.token = t
}

func (this *GateUser) GetDefaultAddress() *msg.UserAddress {
	if this.GetAddressSize() != 0 {
		return this.addrlist[0]
	}
	return nil
}

func (this *GateUser) SetDefaultAddress(addr string) {
	//this.address = addr
}

func (this *GateUser) AddAddress(receiver, phone, address string) {
	addr := &msg.UserAddress{Receiver: pb.String(receiver), Phone: pb.String(phone), Address: pb.String(address)}
	this.addrlist = append(this.addrlist, addr)
}

func (this *GateUser) GetAddressSize() uint32 {
	return uint32(len(this.addrlist))
}

func (this *GateUser) Verifykey() string {
	return this.verifykey
}

func (this *GateUser) IsOnline() bool {
	return this.online
}

func (this *GateUser) IsCleanUp() bool {
	return this.cleanup
}

func (this *GateUser) SendMsg(msg pb.Message) {
	if this.online == false {
		log.Info("账户[%s] [%d %s] 不在线", this.Account(), this.Id(), this.Name())
		return
	}
	this.client.SendCmd(msg)
}

// 玩家全部数据
func (this *GateUser) SendUserBase() {
	send := &msg.GW2C_SendUserInfo{}
	entity, base, item := this.bin.GetEntity(), this.bin.GetBase(), this.bin.GetItem()
	// clone类似c++的copyfrom
	send.Entity = pb.Clone(entity).(*msg.EntityBase)
	send.Base = pb.Clone(base).(*msg.UserBase)
	send.Item = pb.Clone(item).(*msg.ItemBin)
	this.SendMsg(send)
}

func (this *GateUser) IsLoadDB() bool {
	return this.bin != nil
}

func (this *GateUser) LoadDB() bool {
	key, info := fmt.Sprintf("accounts_%s", this.account), &msg.AccountInfo{}
	if err := utredis.GetProtoBin(Redis(), key, info); err != nil {
		log.Error("账户%s 获取账户数据失败，err: %s", this.account, err)
		return false
	}

	// 获取游戏数据
	this.bin = new(msg.Serialize)
	userkey := fmt.Sprintf("userbin_%d", info.GetUserid())
	if err := utredis.GetProtoBin(Redis(), userkey, this.bin); err != nil {
		log.Error("账户%s 获取玩家数据失败，err: %s", this.account, err)
		return false
	}

	this.OnLoadDB("登陆")
	return true
}

func (this *GateUser) OnLoadDB(way string) {
	log.Info("玩家数据: ==========")
	log.Info("账户%s 加载DB数据成功 方式[%s]", this.account, way)
	log.Info("%v", this.bin)
	log.Info("玩家数据: ==========")

	// 没有名字取个名字
	entity := this.bin.GetEntity()
	if entity == nil {
		this.bin.Entity = &msg.EntityBase{}
	}
	if entity.GetName() == "" {
		entity.Name = pb.String(fmt.Sprintf("%d_name", this.Id()))
	}

	// proto对象变量初始化
	if this.bin.Base == nil {
		this.bin.Base = &msg.UserBase{}
	}
	if this.bin.Base.Scounter == nil {
		this.bin.Base.Scounter = &msg.SimpleCounter{}
	}

	// 加载二进制
	this.LoadBin()

	// 新用户回调
	if this.tm_login == 0 {
		this.OnCreateNew()
	}
}

// 打包数据到二进制结构
func (this *GateUser) PackBin() *msg.Serialize {
	bin := &msg.Serialize{}

	// 基础信息
	bin.Entity = pb.Clone(this.bin.GetEntity()).(*msg.EntityBase)

	if bin.Base == nil {
		bin.Base = &msg.UserBase{}
	}
	if bin.Base.Scounter == nil {
		bin.Base.Scounter = &msg.SimpleCounter{}
	}
	if bin.Base.Power == nil {
		bin.Base.Power = &msg.PowerData{}
	}

	userbase := bin.GetBase()
	userbase.Tmlogin = pb.Int64(this.tm_login)
	userbase.Tmlogout = pb.Int64(this.tm_logout)
	userbase.Money = pb.Uint32(this.money)
	userbase.Coupon = pb.Uint32(this.coupon)
	userbase.Yuanbao = pb.Uint32(this.yuanbao)
	userbase.Level = pb.Uint32(this.level)
	userbase.Exp = pb.Uint32(this.exp)
	userbase.Continuelogin = pb.Uint32(this.continuelogin)
	userbase.Nocountlogin = pb.Uint32(this.nocountlogin)
	userbase.Signreward = pb.Uint32(this.signreward)
	userbase.Signtime = pb.Uint32(this.signtime)
	userbase.Gold = pb.Uint64(this.gold)
	userbase.GetPower().Power = pb.Uint32(this.power)
	userbase.GetPower().Nexttime = pb.Uint64(this.nextpowertime)
	userbase.GetPower().Maxpower = pb.Uint32(this.maxpower)
	bin.Guideid = pb.Uint32(this.guide)
	//userbase.Addrlist = this.addrlist[:]

	// 道具信息
	this.bag.PackBin(bin)
	this.maid.PackBin(bin)
	this.palace.PackBin(bin)
	this.travel.PackBin(bin)
	this.PackBox(bin)
	//
	return bin
}

// 将二进制解析出来
func (this *GateUser) LoadBin() {

	// 基础信息

	// 玩家信息
	userbase := this.bin.GetBase()
	this.tm_login = userbase.GetTmlogin()
	this.tm_logout = userbase.GetTmlogout()
	this.money = userbase.GetMoney()
	this.coupon = userbase.GetCoupon()
	this.yuanbao = userbase.GetYuanbao()
	this.level = userbase.GetLevel()
	this.exp = userbase.GetExp()
	this.continuelogin = userbase.GetContinuelogin()
	this.nocountlogin = userbase.GetNocountlogin()
	this.signreward = userbase.GetSignreward()
	this.signtime = userbase.GetSigntime()
	this.gold = userbase.GetGold()
	this.power = userbase.GetPower().GetPower()
	this.maxpower = userbase.GetPower().GetMaxpower()
	this.nextpowertime = userbase.GetPower().GetNexttime()
	this.guide = this.bin.GetGuideid()
	//this.addrlist = userbase.GetAddrlist()[:]
	// 道具信息
	this.bag.Clean()
	this.bag.LoadBin(this.bin)
	this.maid.Init()
	this.maid.LoadBin(this,this.bin)
	this.palace.Init()
	this.palace.LoadBin(this, this.bin)
	this.travel.Init()
	this.travel.LoadBin(this, this.bin)
	this.LoadBox(this.bin)
}

// TODO: 存盘可以单独协程
func (this *GateUser) Save() {
	key := fmt.Sprintf("userbin_%d", this.Id())
	bin := this.PackBin()
	this.bin = bin
	if err := utredis.SetProtoBin(Redis(), key, bin); err != nil {
		log.Error("保存玩家[%s %d]数据失败", this.Name(), this.Id())
		return
	}

	log.Info("保存玩家[%s %d]数据成功", this.Name(), this.Id())
}

// 异步存盘完成回调
func (this *GateUser) AsynSaveFeedback() {
	this.savedone = true
}

// 新用户回调
func (this *GateUser) OnCreateNew() {
	//创建新侍女
	this.power = uint32(tbl.Common.PowerInit)
	this.maxpower = uint32(tbl.Common.PowerMax)
	this.nextpowertime = uint64(util.CURTIME()) + uint64(tbl.Common.PowerAddInterval)
	this.travel.CreateNew()
	this.GenerateBox(1, 1, 1)
	this.Save()
}

// 上线回调，玩家数据在LoginOk中发送
func (this *GateUser) Online(session network.IBaseNetSession) bool {

	if this.online == true {
		log.Error("Sid[%d] 账户[%s] 玩家[%d %s] Online失败，已经处于在线状态", this.Sid(), this.account, this.Id(), this.Name())
		return false
	}

	curtime := util.CURTIME()
	this.tickers.Start()
	this.asynev.Start(int64(this.Id()), 100)
	this.LoginStatistics()
	this.online = true
	this.client = session
	this.tm_login = curtime
	this.tm_disconnect = 0
	this.tm_heartbeat = util.CURTIMEMS()
	this.savedone = false
	this.UpdatePower(uint64(curtime))
	log.Info("Sid[%d] 账户[%s] 玩家[%d] 名字[%s] 登录成功", this.Sid(), this.account, this.Id(), this.Name())
	this.maid.Online(this)
	this.travel.Online(this)
	this.bin = this.PackBin()
	// 同步数据到客户端
	this.Syn()

	return true
}

func (this *GateUser) Syn() {
	this.CheckHaveCompensation()
	this.QueryPlatformCoins()

    send := &msg.GW2C_HeartBeat{}
    send.Uid = pb.Int64(int64(this.Id()))
    send.Time = pb.Int64(util.CURTIMEUS())
	this.SendMsg(send)
	this.maid.Syn(this)
	this.palace.Syn(this)
	this.travel.Syn(this)
	this.SynBox()
	this.SynGuide()
	this.SendUserBase()
}

// 断开连接回调
func (this *GateUser) OnDisconnect() {
	log.Info("sid[%d] 账户%s 玩家[%s %d] 断开连接", this.Sid(), this.account, this.Name(), this.Id())
	if this.online == false {
		return
	}
	this.online = false
	this.client = nil
	this.tm_disconnect = util.CURTIMEMS()
	this.PlatformPushUserOnlineTime()
}

// 服务器下线玩家
func (this *GateUser) KickOut(way string) {
	log.Info("sid[%d] 账户[%s] [%d %s] KickOut 原因[%s]", this.Sid(), this.account, this.Id(), this.Name(), way)
	if this.online == false {
		return
	}
	this.online = false
	this.client.Close()
	this.client = nil
	this.tm_disconnect = util.CURTIMEMS()
	this.PlatformPushUserOnlineTime()
}

// 检查下线存盘
func (this *GateUser) CheckDisconnectTimeOut(now int64) {
	if this.tm_disconnect == 0 {
		return
	}

	// 延迟存盘清理
	if now < this.tm_disconnect+tbl.Global.Disconclean {
		return
	}

	// 异步事件未处理完
	if this.asynev.EventSize() != 0 || this.asynev.FeedBackSize() != 0 {
		return
	}

	// 异步存盘，最大延迟1秒
	//if this.tm_asynsave == 0 {
	//	this.tm_asynsave = now + 1000
	//	event := NewUserSaveEvent(this.Save)
	//	this.AsynEventInsert(event)
	//}
	//if now < this.tm_asynsave {
	//	return
	//}

	this.Logout()
}

// 真下线(存盘，从Gate清理玩家数据)
func (this *GateUser) Logout() {
	this.online = false
	this.tm_logout = util.CURTIME()
	this.cleanup = true
	this.Save()
	UnBindingAccountGateWay(this.account)
	this.asynev.Shutdown()

	log.Info("账户%s 玩家[%s %d] 存盘下线", this.account, this.Name(), this.Id())
}

// logout完成，做最后清理
func (this *GateUser) OnCleanUp() {
	this.tickers.Stop()
}

// 发送个人通知
func (this *GateUser) SendNotify(text string) {
	send := &msg.GW2C_MsgNotify{Text: pb.String(text)}
	this.SendMsg(send)
}

//发送个人通知2
func (this *GateUser) SendNotify2(text string) {
	send := &msg.GW2C_MsgNotice{Userid: pb.Uint64(0), Name: pb.String(""), Face: pb.String(""), Type: pb.Int32(int32(msg.NoticeType_Marquee)), Text: pb.String(text)}
	this.SendMsg(send)
}

// 回复客户端
func (this *GateUser) ReplyStartGame(err string, roomid int64) {
	send := &msg.GW2C_RetStartGame{Errcode: pb.String(err), Roomid: pb.Int64(roomid)}
	this.SendMsg(send)
	if err != "" {
		log.Info("玩家[%s %d] 开始游戏失败: roomid=%d errcode=%s", this.Name(), this.Id(), roomid, err)
	}
}

// 插入新异步事件
func (this *GateUser) AsynEventInsert(event eventque.IEvent) {
	this.asynev.Push(event)
}

// 获取平台金币
func (this *GateUser) QueryPlatformCoins() {
	event := NewQueryPlatformCoinsEvent(this.SyncPlatformCoins)
	this.AsynEventInsert(event)
}

func (this *GateUser) SyncPlatformCoins() {
	errcode, coins, _ := def.HttpRequestFinanceQuery(this.Id(), this.Token(), this.Account())
	if errcode != "" {
		return
	}

	send := &msg.GW2C_SendUserPlatformMoney{Coins: pb.Int32(coins)}
	this.SendMsg(send)
}

// 扣除平台金币
func (this *GateUser) RemovePlatformCoins(amount int32, desc string) bool {
	tvmid := this.Account()
	removeok := def.HttpRequestDecrCoins(this.Id(), this.Token(), tvmid, amount, desc)
	if removeok == true {
		log.Info("玩家[%d] 扣除金币[%d] 库存[%d] 原因[%s]", this.Id(), amount, 0, desc)
	}
	return removeok
}

// 增加平台金币
func (this *GateUser) AddPlatformCoins(amount int32, desc string) bool {
	tvmid := this.Account()
	addok := def.HttpRequestIncrCoins(this.Id(), this.Token(), tvmid, amount, desc)
	if addok == true {
		log.Info("玩家[%d] 增加金币[%d] 库存[%d] 原因[%s]", this.Id(), amount, 0, desc)
	}
	return addok
}

// 推送资源消耗
func (this *GateUser) PlatformPushConsumeMoney(yuanbao float32) {
	rmbcent := 100.0 * yuanbao / float32(tbl.Room.RmbToYuanbao)
	arglist := []interface{}{this.Account(), this.Token(), uint64(this.Id()), uint32(rmbcent)}
	event := eventque.NewCommonEvent(arglist, def.HttpRequestUserResourceConsumeArglist, nil)
	this.AsynEventInsert(event)
}

// 推送资源获取
func (this *GateUser) PlatformPushLootMoney(yuanbao float32) {
	rmbcent := 100.0 * yuanbao / float32(tbl.Room.RmbToYuanbao)
	arglist := []interface{}{this.Account(), this.Token(), uint64(this.Id()), uint32(rmbcent)}
	event := eventque.NewCommonEvent(arglist, def.HttpRequestUserResourceEarnArglist, nil)
	this.AsynEventInsert(event)
}

// 推送在线时长
func (this *GateUser) PlatformPushUserOnlineTime() {
	tm_onlinestay := (util.CURTIME() - this.tm_login) / 60
	if tm_onlinestay <= 0 {
		return
	}

	arglist := []interface{}{this.Account(), this.Token(), uint64(this.Id()), int64(tm_onlinestay)}
	event := eventque.NewCommonEvent(arglist, def.HttpRequestUserOnlineTimeArglist, nil)
	this.AsynEventInsert(event)
}

// 发货状态解除
func (this *GateUser) SetDeliveryState(b bool) {
	this.deliverystate = b
}

func (this *GateUser) DeliveryState() bool {
	return this.deliverystate
}

// 宫斗游戏系统 
// 最大宫女变化了
func (this *GateUser) ChangeMaxLevel(level uint32) {
	this.palace.ChangeMaxLevel(this, level)
}

func (this *GateUser) GetCountByLevel(level uint32) uint32{
	retCount := this.maid.GetMaidCountByLevel(level)
	for _, v := range this.boxs {
		if v.level == level {
			retCount = retCount + v.num
		}
	}
	return retCount
}

func (this *GateUser) SynGuide() {
	send := &msg.GW2C_AckGuideData{}
	send.Guide = pb.Uint32(this.guide)
	this.SendMsg(send)
}