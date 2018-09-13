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
}

func (this *UserMaid) Init() {
	this.maxid = 0
	this.maids = make(map[uint32]*MaidData)
	this.shop = make(map[uint32]*MaidShop)
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
// ========================= 消息接口 ========================= 
//购买侍女 
func (this *UserMaid) BuyMaid(user *GateUser,id uint32) (result uint32 ,addition *MaidData){
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[this.maxid]
	if !find {
		return 1,nil
	}
	shopdata, find := this.shop[id]
	if !find {
		return 2,nil
	}
	if user.GetGold() < shopdata.price {
		return 3,nil
	}
	//可以买了
	maid := this.AddMaid(user,id,1)
	user.RemoveGold(shopdata.price, "购买侍女")
	return 0, maid
}

//合并侍女
func (this *UserMaid) MergeMaid(user *GateUser,id uint32) (result uint32,removed *MaidData, addition *MaidData){
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		return 1,nil,nil
	}
	nextid := uint32(maidconfg.NextID)
	if nextid == 0 {
		return 2,nil,nil
	}
	maid, ok := this.maids[id]; 
	if !ok {
		return 3,nil,nil
	}
	if maid.count < 2 {
		return 4,nil,nil
	}
	//可以了 合并
	removed = this.RemoveMaid(id,2)
	if removed == nil {
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
		oldshop, find := this.shop[v]
		if find {
			//找不到初始化价格
			maidshop, find := tbs.TMaidShopBase.TMaidShopById[v]
			price := 0
			if find {
				price = maidshop.Price
			}
			shop := &MaidShop{}
			shop.id = v
			shop.price = price
			newShop[v] = oldshop
		} else {
			// 继承老的价格
			newShop[oldshop.id] = oldshop
		}
	}
	//修改吧
	this.maxid = id
	this.shop = newShop

	send := &GW2C_AckMaidShop{Shop:make([]*msg.MaidShopData,0)}
	for _, v := range this.shop {
		send.Shop = append(shend.Shop,v.PackBin())
	}
	user.SendMsg(send)
}