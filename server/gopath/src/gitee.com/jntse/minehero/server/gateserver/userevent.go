package main
import (
	"fmt"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	pb "github.com/golang/protobuf/proto"
)

// --------------------------------------------------------------------------
/// @brief 后宫数据
// --------------------------------------------------------------------------
type TravelData struct {
	nexttime		uint64
	items 			[]*msg.PairNumItem
	eventid			uint32
}

func (this *TravelData) PackData() *msg.TravelData{
	data := &msg.TravelData{}
	data.Nexttime = pb.Uint64(this.nexttime)
	for _, v := range this.items {
		data.Items = append(data.Items, &msg.PairNumItem{ Itemid: pb.Uint32(v.GetItemid()), Num: pb.Uint64(v.GetNum())})
	}
	data.Eventid = pb.Uint32(this.eventid)
	return data
}

func (this *TravelData) LoadData(data *msg.TravelData) {
	this.nexttime = data.GetNexttime()
	this.items = data.GetItems()
	this.eventid = data.GetEventid()
}

// --------------------------------------------------------------------------
/// @brief 玩家后宫
// --------------------------------------------------------------------------
type UserTravel struct {
	travel			*TravelData
	eventids		[]uint32
}

func (this *UserTravel) Init() {
	this.travel = &TravelData{}
	this.eventids = make([]uint32, 0)
}
//加载数据
func (this *UserTravel) LoadBin(user *GateUser,bin *msg.Serialize) {
	travel := bin.GetTravel();
	this.travel.LoadData(travel)
	for _, data := range bin.GetEventids() {
		this.eventids = append(this.eventids, data)
	}
}

func (this *UserTravel) PackBin(bin *msg.Serialize) {
	bin.Travel = this.travel.PackData()
	bin.Eventids = make([]uint32, 0)
	for _, v := range this.eventids {
		bin.Eventids = append(bin.Eventids, v)
	}
}
// ========================= 对外接口 ========================= 
func (this *UserTravel) Syn(user* GateUser) {
	this.SynTravelData(user)
	this.SynEventids(user)
}
func (this *UserTravel) SynTravelData(user *GateUser){
	send := &msg.GW2C_AckTravelData{}
	send.Data = this.travel.PackData()
	user.SendMsg(send)
}
func (this *UserTravel) SynEventids(user *GateUser){
	send := &msg.GW2C_AckEventData{ Ids: make([]uint32, 0)}
	for _, v := range this.eventids {
		send.Ids = append(send.Ids, v)
	}
	user.SendMsg(send)
}
// ========================= 消息接口 =========================
//上供
func (this *UserTravel) PrepareTravel(user* GateUser, items []*msg.PairNumItem) (result uint32){
	if this.travel.eventid != 0 {
		user.SendNotify("还有已触发事件未查看")
		return 1
	}
	//检查物品够不够
	for k, v := range items {
		if this.travel.items[k].GetItemid() != v.GetItemid() && v.GetItemid() != 0{
			if user.bag.GetItemNum(v.GetItemid()) < uint32(v.GetNum()) {
				user.SendNotify(fmt.Sprintf("道具%d数量不够", v.GetItemid()))
				return 2
			}
		}
	}
	//可以上供了
	//先把原来上供的拿下来
	for _, v := range this.travel.items{
		user.AddItem(v.GetItemid(), uint32(v.GetNum()), "取消上供")
	}
	//修改上供数据
	this.travel.items = items
	//扣道具吧
	for _, v := range this.travel.items{
		if v.GetItemid() != 0 {
			user.RemoveItem(v.GetItemid(), uint32(v.GetNum()), "上供")
		}
	}
	return 0
}

// 查看事件 
func (this *UserTravel) CheckEvent(user* GateUser) (result uint32) {
	if this.travel.eventid == 0 {
		user.SendNotify("没有事件可被查看")
		return 1
	}
	//那看完了
	finded := false
	for _, v := range this.eventids {
		if v == this.travel.eventid {
			finded = true
			break
		}
	}
	if !finded {
		this.eventids = append(this.eventids, this.travel.eventid)
	}
	this.travel.eventid = 0
	return 0
}
// ========================= 数据处理 ========================= 
// 随机事件吧
func (this *UserTravel) RandomEvent() uint32 {
	if len(this.travel.items) < 3 {
		return 0
	}
	key := fmt.Sprintf("%d_%d_%d",this.travel.items[0].GetItemid(),this.travel.items[1].GetItemid(),this.travel.items[2].GetItemid())
	travel, find := tbl.TTravelBase.TravelById[key]
	if !find {
		//要疯狂查询咯
		return 0
	}
	return travel.Event
}