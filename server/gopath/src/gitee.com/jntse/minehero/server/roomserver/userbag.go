package main
import "gitee.com/jntse/minehero/pbmsg"
import "gitee.com/jntse/gotoolkit/log"
import pb "github.com/gogo/protobuf/proto"
import "gitee.com/jntse/minehero/server/tbl"
import "gitee.com/jntse/minehero/server/tbl/excel"


// --------------------------------------------------------------------------
/// @brief 道具
// --------------------------------------------------------------------------
type Item struct {
	bin *msg.ItemData
	base *table.ItemBaseDataDefine
	equipbase *table.EquipDefine
}

func (t *Item) Bin() *msg.ItemData {
	return t.bin
}

func (t *Item) Id() uint32 {
	return t.bin.GetId()
}

func (t *Item) BaseId() uint32 {
	return t.base.Id
}

func (t *Item) Name() string {
	return t.base.Name
}

func (t *Item) Pos() int32 {
	return t.bin.GetPos()
}

func (t *Item) Num() uint32 {
	return t.bin.GetNum()
}

func (t *Item) Inc(num uint32) {
	t.bin.Num = pb.Uint32(t.Num() + num)
}

func (t *Item) Dec(num uint32) {
	if t.Num() < num { num = t.Num() }
	t.bin.Num = pb.Uint32(t.Num() - num)
}

func (t *Item) SetPos(pos int32) {
	t.bin.Pos = pb.Int32(pos)
}

func (t *Item) EquipBase() *table.EquipDefine {
	return t.equipbase
}

func NewItem(data *msg.ItemData) *Item {
	base := FindItemBase(data.GetId())
	if base == nil { 
		log.Error("创建道具[%d]，找不到配置", data.GetId())
		return nil
	}

	item := new(Item)
	item.bin = data
	item.base = base
	item.equipbase = FindEquipBase(data.GetId())
	return item
}

func NewItemData(id uint32, num uint32, pos int32) *msg.ItemData {
	data := &msg.ItemData { Id:pb.Uint32(id), Num:pb.Uint32(num), Pos:pb.Int32(pos) }
	return data
}

func FindItemBase(id uint32) *table.ItemBaseDataDefine {
	return tbl.ItemBase.ItemBaseDataById[id]
}

func FindEquipBase(id uint32) *table.EquipDefine {
	return tbl.TEquipBase.EquipById[int32(id)]
}

// --------------------------------------------------------------------------
/// @brief 背包
// --------------------------------------------------------------------------
type UserBag struct {
	items	map[uint32]*Item
	names	map[string]*Item
	owner	*RoomUser
}

func (this *UserBag) Init(user *RoomUser) {
	this.items = make(map[uint32]*Item)
	this.names = make(map[string]*Item)
	this.owner = user
}

func (this *UserBag) LoadBin(bin *msg.Serialize) {
	itembin := bin.GetItem();
	if itembin == nil { return }
	for _, data := range itembin.GetItems() {
		if data.GetPos() != int32(msg.ItemPos_Bag) { continue }
		item := NewItem(data)
		if item != nil {  this.LoadItemObj(item) }
	}
}

func (this *UserBag) PackBin(bin *msg.Serialize) {
	bin.Item = &msg.ItemBin{Items:make([]*msg.ItemData,0)}
	itembin := bin.GetItem();
	for _, item := range this.items {
		itembin.Items = append(itembin.Items, item.bin)
	}
}

func (this *UserBag) FindById(id uint32) *Item {
	return this.items[id]
}

func (this *UserBag) FindByName(name string) *Item {
	return this.names[name]
}

func (this *UserBag) FindByPos(pos int32) *Item {
	for _, item := range this.items {
		if item.Pos() == pos { return item }
	}
	return nil
}

func (this *UserBag) LoadItemObj(item *Item) {
	this.items[item.Id()] = item
	this.names[item.Name()] = item
	log.Info("加载背包道具%+v", item.bin)
	log.Info("加载背包道具%+v", item.base)
}

func (this *UserBag) AddItem(id uint32, num uint32, reason string) *Item {
	item := this.FindById(id)
	if item != nil {
		item.Inc(num)
	}else {
		item = NewItem(NewItemData(id, num, int32(msg.ItemPos_Bag)))
		if item == nil { 
			log.Error("玩家[%d] 添加道具[%d]失败", this.owner.Id(), id)
			return nil 
		}
		this.items[item.Id()] = item
		this.names[item.Name()] = item
	}

	send := &msg.GW2C_AddPackageItem{Itemid:pb.Uint32(id), Num:pb.Uint32(num) }
	this.owner.SendClientMsg(send)
	log.Info("玩家[%d] 添加道具[%d] 数量[%d] 库存[%d] 原因[%s]", this.owner.Id(), id, num, item.Num(), reason)
	return item
}

func (this *UserBag) RemoveItem(id uint32, num uint32, reason string) bool {

	item, leftnum := this.FindById(id), uint32(0)
	if item == nil {
		log.Error("[道具] 道具[%d] 一个也没有", id)
		return  false
	}

	if item.Num() < num {
		log.Info("玩家[%d] 扣除道具[%d]失败 数量[%d] 库存[%d] 原因[%s]", this.owner.Id(), id, num, leftnum, reason)
		return false
	}

	if item.Num() > num {
		item.Dec(num)
		leftnum = item.Num()
	} else if item.Num() == num{
		delete(this.items, id)
		delete(this.names, item.Name())
	}
	log.Info("玩家[%d] 扣除道具[%d] 数量[%d] 库存[%d] 原因[%s]", this.owner.Id(), id, num, leftnum, reason)
	return true
}

// 穿戴服装
func (this *UserBag) DressClothes(pos int32, itemid int32) {
	newEquip := this.FindById(uint32(itemid))
	if newEquip != nil {
		this.owner.SendNotify("找不到穿戴的服装")
		return
	}

	equipbase := newEquip.EquipBase()
	if equipbase == nil {
		this.owner.SendNotify("只能穿戴服装道具")
		return
	}

	if equipbase.Pos != pos {
		this.owner.SendNotify("不能穿戴这个位置")
		return
	}

	// 
	newEquip.SetPos(pos)

	send := &msg.GW2C_UpdateItemPos{Items:make([]*msg.ItemData,0)}
	send.Items = append(send.Items, newEquip.Bin())
	this.owner.SendMsg(send)
}

// 脱下服装
func (this *UserBag) UnDressClothes(pos int32) {
	item := this.FindByPos(pos)
	if item != nil {
		item.SetPos(int32(msg.ItemPos_Bag))

		send := &msg.GW2C_UpdateItemPos{Items:make([]*msg.ItemData,0)}
		send.Items = append(send.Items, item.Bin())
		this.owner.SendMsg(send)
	}
}

func (this *UserBag) UnDressAll() {
	send := &msg.GW2C_UpdateItemPos{Items:make([]*msg.ItemData,0)}
	for _, item := range this.items {
		if item.Pos() == int32(msg.ItemPos_Bag) { continue }
		item.SetPos(int32(msg.ItemPos_Bag))
		send.Items = append(send.Items, item.Bin())
	}
	this.owner.SendMsg(send)
}


