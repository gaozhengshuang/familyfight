package main
import (
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/gotoolkit/util"
	pb "github.com/golang/protobuf/proto"
	"math"
)

// --------------------------------------------------------------------------
/// @brief 侍女数据
// --------------------------------------------------------------------------
type MaidData struct {
	id				uint32
	count 			uint32
}

func (this *MaidData) PackBin() *msg.MaidData{
	data := &msg.MaidData{}
	data.Id = pb.Uint32(this.id)
	data.Count = pb.Uint32(this.count)
	return data
}

// --------------------------------------------------------------------------
/// @brief 侍女商店
// --------------------------------------------------------------------------
type MaidShop struct {
	id 				uint32
	times 			uint32
}

func (this *MaidShop) PackBin() *msg.MaidShopData{
	data := &msg.MaidShopData{}
	data.Id = pb.Uint32(this.id)
	data.Times = pb.Uint32(this.times)
	return data
}

// --------------------------------------------------------------------------
/// @brief 玩家侍女
// --------------------------------------------------------------------------
type UserMaid struct {
	maids			map[uint32]* MaidData
	maxid 			uint32
	shop 			map[uint32]* MaidShop

	maidCountByLevel map[uint32]uint32
}

func (this *UserMaid) Init() {
	this.maxid = 0
	this.maids = make(map[uint32]*MaidData)
	this.shop = make(map[uint32]*MaidShop)
	this.maidCountByLevel = make(map[uint32]uint32)
}
//加载数据
func (this *UserMaid) LoadBin(user *GateUser,bin *msg.Serialize) {
	maidbin := bin.GetMaid()
	if maidbin == nil { return }
	this.maxid = maidbin.GetMaxid()
	for _, data := range maidbin.GetDatas() {
		this.AddMaid(user,data.GetId(),data.GetCount())
	}
	for _, data := range maidbin.GetShop() {
		shop := &MaidShop{}
		shop.id = data.GetId()
		shop.times = data.GetTimes()
		this.shop[data.GetId()] = shop
	}
	//计算每个关卡的侍女数量
	maxLevel := this.GetLevelByMaid(this.maxid)
	for i := uint32(1); i < maxLevel; i++ {
		this.CalculateMaidCountByLevel(i)
	}
}

func (this *UserMaid) PackBin(bin *msg.Serialize) {
	bin.Maid = &msg.MaidBin{Datas:make([]*msg.MaidData,0),Shop:make([]*msg.MaidShopData,0)}
	maidbin := bin.GetMaid()
	maidbin.Maxid = pb.Uint32(this.maxid)
	for _, maid := range this.maids {
		maidbin.Datas = append(maidbin.Datas,maid.PackBin())
	}
	for _, shop := range this.shop {
		maidbin.Shop = append(maidbin.Shop,shop.PackBin())
	}
}
// ========================= 对外接口 ========================= 
func (this *UserMaid) GetMaxId() uint32 {
	return this.maxid
}

func (this *UserMaid) Online(user* GateUser) {
	//上线了 要给离线奖励了
	if user.tm_logout == 0 {
		user.tm_logout = util.CURTIME()
		return
	}
	passedtime := user.tm_login - user.tm_logout
	rewardpersecond := this.CalculateRewardPerSecond(user)
	addition := user.TimesBigGold(rewardpersecond,uint32(passedtime))
	if len(addition) > 0 {
		// user.AddBigGold(addition, "离线侍女奖励")
		send := &msg.GW2C_OfflineReward{}
		send.Golds = user.ParseBigGoldToArr(user.CarryBigGold(addition, user.MaxIndexBigGold(addition)))
		user.SendMsg(send)
	}
}

func (this *UserMaid) Syn(user* GateUser) {
	maidSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
	for _, v := range this.maids {
		maidSend.Datas = append(maidSend.Datas, v.PackBin())
	}
	maidSend.Maxid = pb.Uint32(this.GetMaxId())
	user.SendMsg(maidSend)

	this.SynMaidShop(user)
}

func (this *UserMaid) SynMaidShop(user* GateUser) {
	shopSend := &msg.GW2C_AckMaidShop{Shop:make([]*msg.MaidShopData,0)}
	for _, v := range this.shop {
		shopSend.Shop = append(shopSend.Shop,v.PackBin())
	}
	user.SendMsg(shopSend)
}
// ========================= 消息接口 ========================= 
//购买侍女 
func (this *UserMaid) BuyMaid(user *GateUser,id uint32) (result uint32 ,addition *MaidData,price []string){
	price = make([]string, 0)
	shopdata, find := this.shop[id]
	if !find {
		user.SendNotify("没有对应的商店信息")
		return 1,nil,price
	}
	maidshop, find := tbl.TMaidShopBase.TMaidShopById[id]
	if !find {
		user.SendNotify("没有对应的商店信息")
		return 1,nil,price
	}
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		user.SendNotify("没有对应的侍女配置")
		return 2,nil,price
	}
	price = maidshop.Price
	//计算价格
	oldpriceObj, maxIndex := user.ParseBigGoldToObj(price)
	times := math.Pow(float64(tbl.Common.PriceAdditionPerBuy), float64(shopdata.times))
	oldpriceObj = user.TimesBigGold(oldpriceObj, uint32(times))
	oldpriceObj = user.CarryBigGold(oldpriceObj, maxIndex)
	price = user.ParseBigGoldToArr(oldpriceObj)

	count := user.GetCountByLevel(uint32(maidconfg.Passlevels))
	if count >= 20 {
		user.SendNotify("该关卡侍女数量已达上限")
		return 3,nil,price
	}	
	//可以买了
	maid := this.AddMaid(user,id,1)
	//更新价格咯
	shopdata.times = shopdata.times + 1
	return 0, maid, price
}

//合并侍女
func (this *UserMaid) MergeMaid(user *GateUser,id uint32) (result uint32,removed *MaidData, addition *MaidData){
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		user.SendNotify("没有对应的侍女配置")
		return 1,nil,nil
	}
	nextid := uint32(maidconfg.NextID)
	if nextid == 0 {
		user.SendNotify("没有下一级的配置了")
		return 2,nil,nil
	}
	nextconfig, find := tbl.TMaidLevelBase.TMaidLevelById[nextid]
	if !find {
		user.SendNotify("没有下一级的配置了")
		return 2,nil,nil
	}
	if uint32(maidconfg.Passlevels) != uint32(nextconfig.Passlevels){
		if user.GetCountByLevel(uint32(nextconfig.Passlevels)) >= 20 {
			user.SendNotify("下一关侍女数量已达上限")
			return 6,nil,nil
		}
	}
	maid, ok := this.maids[id]
	if !ok {
		user.SendNotify("侍女数量不够")
		return 3,nil,nil
	}
	if maid.count < 2 {
		user.SendNotify("侍女数量不够")
		return 4,nil,nil
	}
	//可以了 合并
	removed = this.RemoveMaid(id,2)
	if removed == nil {
		user.SendNotify("侍女移除失败")
		return 5,nil,nil
	}
	addition = this.AddMaid(user,nextid,1)
	return 0,removed,addition
}

// ========================= 数据处理 ========================= 
// 添加侍女
func (this *UserMaid) AddMaid(user *GateUser, id uint32, count uint32) *MaidData {
	maid, ok := this.maids[id]
	if !ok {
		maid = &MaidData{}
		maid.id = id
		maid.count = 0
		this.maids[id] = maid
	}
	maid.count = maid.count + count
	if id > this.maxid {
		this.ChangeMaxId(user,id)
	}
	this.CalculateMaidCountByLevel(this.GetLevelByMaid(id))
	return maid
}

// 减少侍女
func (this *UserMaid) RemoveMaid(id uint32,count uint32) *MaidData {
	maid, ok := this.maids[id]
	if !ok {
		return nil
	}
	if maid.count < count {
		return nil
	}
	maid.count = maid.count - count
	this.CalculateMaidCountByLevel(this.GetLevelByMaid(id))
	return maid
}

//修改拥有的最高的侍女
func (this *UserMaid) ChangeMaxId(user *GateUser,id uint32) {
	if this.maxid >= id {
		return
	}
	maidconfig, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		return
	}
	for _, v := range maidconfig.UnlockShop {
		_, find := this.shop[uint32(v)]
		if !find {
			//找不到初始化价格
			shop := &MaidShop{}
			shop.id = uint32(v)
			shop.times = 0
			this.shop[shop.id] = shop
		}
	}
	//修改吧
	this.maxid = id
	user.ChangeMaxLevel(uint32(maidconfig.Passlevels))
	this.SynMaidShop(user)
}

func (this *UserMaid) CalculateRewardPerSecond(user *GateUser) map[uint32]uint32 {
	retObj := make(map[uint32]uint32, 0)
	for _, v := range this.maids {
		maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[v.id]
		if !find {
			continue
		}
		rewardObj, _ := user.ParseBigGoldToObj(maidconfg.Reward)
		for i, o := range rewardObj {
			value, find := retObj[i]
			if find {
				retObj[i] = value + uint32(o) * uint32(v.count)
			} else {
				retObj[i] = uint32(o) * uint32(v.count)
			}
		}
	}
	return retObj
}

func (this *UserMaid) CalculateMaxMaidReward20Seconds(user *GateUser) map[uint32]uint32 {
	retObj := make(map[uint32]uint32, 0)
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[this.maxid]
	if find {
		retObj, _ = user.ParseBigGoldToObj(maidconfg.Reward)
		retObj = user.TimesBigGold(retObj, 20)
	}
	return retObj
}
//重新计算关卡中的侍女数量
func (this *UserMaid) CalculateMaidCountByLevel(level uint32) {
	count := uint32(0)
	for _, v := range this.maids {
		maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[v.id]
		if !find {
			continue
		}
		if uint32(maidconfg.Passlevels) == level {
			count = count + v.count
		}
	}
	this.maidCountByLevel[level] = count
}

//获得关卡中的侍女数量
func (this *UserMaid) GetMaidCountByLevel(level uint32) uint32 {
	count, find := this.maidCountByLevel[level]
	if !find {
		return 0
	}
	return count
}

//根据侍女id获得所在关卡
func (this *UserMaid) GetLevelByMaid(id uint32) uint32 {
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		return 0
	}
	return uint32(maidconfg.Passlevels)
}

func (this *UserMaid) GetMaxLevel() uint32 {
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[this.maxid]
	if !find {
		return 0
	}
	return uint32(maidconfg.Passlevels)
}
