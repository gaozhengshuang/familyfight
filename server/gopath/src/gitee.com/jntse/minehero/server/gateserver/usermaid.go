package main
import (
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/golang/protobuf/proto"
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
	price 			uint64
}

func (this *MaidShop) PackBin() *msg.MaidShopData{
	data := &msg.MaidShopData{}
	data.Id = pb.Uint32(this.id)
	data.Price = pb.Uint64(this.price)
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
	maidbin := bin.GetMaid();
	if maidbin == nil { return }
	this.maxid = maidbin.GetMaxid()
	for _, data := range maidbin.GetDatas() {
		this.AddMaid(user,data.GetId(),data.GetCount())
	}
	for _, data := range maidbin.GetShop() {
		shop := &MaidShop{}
		shop.id = data.GetId()
		shop.price = data.GetPrice()
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
	passedtime := user.tm_login - user.tm_logout
	rewardpersecond := this.CalculateRewardPerSecond()
	addition := uint64(passedtime / 1000) * rewardpersecond
	user.AddGold(addition, "离线侍女奖励")
	send := &msg.GW2C_OfflineReward{}
	send.Gold = pb.Uint64(addition)
	user.SendMsg(send)
}

func (this *UserMaid) Syn(user* GateUser) {
	maidSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
	for _, v := range this.maids {
		maidSend.Datas = append(maidSend.Datas, v.PackBin())
	}
	maidSend.Maxid = pb.Uint32(this.GetMaxId())
	user.SendMsg(maidSend)

	shopSend := &msg.GW2C_AckMaidShop{Shop:make([]*msg.MaidShopData,0)}
	for _, v := range this.shop {
		shopSend.Shop = append(shopSend.Shop,v.PackBin())
	}
	user.SendMsg(shopSend)
}
// ========================= 消息接口 ========================= 
//购买侍女 
func (this *UserMaid) BuyMaid(user *GateUser,id uint32) (result uint32 ,addition *MaidData,price uint64){
	shopdata, find := this.shop[id]
	if !find {
		user.SendNotify("没有对应的商店信息")
		return 1,nil,0
	}
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		user.SendNotify("没有对应的侍女配置")
		return 2,nil,0
	}
	count := this.GetMaidCountByLevel(uint32(maidconfg.Passlevels))
	if count >= 20 {
		user.SendNotify("该关卡侍女数量已达上限")
		return 3,nil,0
	}
	//可以买了
	maid := this.AddMaid(user,id,1)
	// user.RemoveGold(shopdata.price, "购买侍女")
	return 0, maid, shopdata.price
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
	maid, ok := this.maids[id]; 
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
	maid, ok := this.maids[id];
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
	maid, ok := this.maids[id];
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
	newShop := make(map[uint32]*MaidShop)
	for _, v := range maidconfig.ShopShow {
		oldshop, find := this.shop[uint32(v)]
		if !find {
			//找不到初始化价格
			maidshop, find := tbl.TMaidShopBase.TMaidShopById[uint32(v)]
			price := uint64(0)
			if find {
				price = uint64(maidshop.Price)
			}
			shop := &MaidShop{}
			shop.id = uint32(v)
			shop.price = price
			newShop[shop.id] = shop
		} else {
			// 继承老的价格
			newShop[oldshop.id] = oldshop
		}
	}
	//修改吧
	this.maxid = id
	this.shop = newShop
	user.ChangeMaxLevel(uint32(maidconfig.Passlevels))

	send := &msg.GW2C_AckMaidShop{Shop:make([]*msg.MaidShopData,0)}
	for _, v := range this.shop {
		send.Shop = append(send.Shop,v.PackBin())
	}
	user.SendMsg(send)
}

func (this *UserMaid) CalculateRewardPerSecond() uint64 {
	ret := uint64(0)
	for _, v := range this.maids {
		maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[v.id]
		if !find {
			continue
		}
		ret = ret + uint64(maidconfg.Reward) * uint64(v.count)
	}
	return ret
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
