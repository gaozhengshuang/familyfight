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
type PalaceData struct {
	id				uint32
	level 			uint32
	maids			[]bool
	endtime			uint64
	parts 			[]uint32
	charm 			uint32
}

func (this *PalaceData) PackBin() *msg.PalaceData{
	data := &msg.PalaceData{}
	data.Id = pb.Uint32(this.id)
	data.Level = pb.Uint32(this.level)
	data.Maids = make([]bool, 0)
	for _, v := range this.maids {
		data.Maids = append(data.Maids, v)
	}
	data.Endtime = pb.Uint64(this.endtime)
	data.Partslevel = make([]uint32, 0)
	for _, v := range this.parts {
		data.Partslevel = append(data.Partslevel, v)
	}
	data.Charm = pb.Uint32(this.charm)
	return data
}

// --------------------------------------------------------------------------
/// @brief 玩家后宫
// --------------------------------------------------------------------------
type UserPalace struct {
	palaces			map[uint32]* PalaceData
}

func (this *UserPalace) Init() {
	this.palaces = make(map[uint32]*PalaceData)
}
//加载数据
func (this *UserPalace) LoadBin(user *GateUser,bin *msg.Serialize) {
	palaces := bin.GetPalaces();
	for _, data := range palaces {
		palace, _ := this.AddPalace(user,data.GetId())
		palace.level = data.GetLevel()
		for index, v := range data.GetMaids() {
			palace.maids[index] = v
		}
		palace.endtime = data.GetEndtime()
		for index, v := range data.GetPartslevel() {
			palace.parts[index] = v
		}
		palace.charm = data.GetCharm()
	}
}

func (this *UserPalace) PackBin(bin *msg.Serialize) {
	bin.Palaces =  make([]*msg.PalaceData,0) 
	for _, palace := range this.palaces {
		bin.Palaces = append(bin.Palaces,palace.PackBin())
	}
}
// ========================= 对外接口 ========================= 
func (this *UserPalace) Syn(user* GateUser) {
	send := &msg.GW2C_AckPalaceData{ Datas: make([]*msg.PalaceData, 0) }
	for _, v := range this.palaces {
		send.Datas = append(send.Datas, v.PackBin())
	}
	user.SendMsg(send)
}
func (this *UserPalace) ChangeMaxLevel(user* GateUser,level uint32) {
	for _, v := range tbl.TPalaceMapBase.PalaceMap {
		if level == uint32(v.UlockPassId) {
			//要解锁这一关了
			_, add := this.AddPalace(user,v.Id)
			if add {
				this.Syn(user)
			}
			return
		}
	}
}
// ========================= 消息接口 =========================
//收取
func (this *UserPalace) TakeBack(user* GateUser, id uint32) (result uint32,items []*msg.PairNumItem, data *msg.PalaceData, gold []string){
	items = make([]*msg.PairNumItem,0)
	gold = make([]string, 0)
	palace, find := this.palaces[id]
	if !find {
		user.SendNotify("后宫尚未开启")
		return 1,items,nil,gold
	}
	palacetmpl := PalaceMgr().GetPalaceConfig(id)
	if palacetmpl == nil {
		user.SendNotify("没有后宫配置")
		return 1,items,nil,gold
	}
	mastertmpl := PalaceMgr().GetMasterConfig(id, palace.level)
	if mastertmpl == nil {
		user.SendNotify("没有主子配置")
		return 2,items,nil,gold
	}
	maidsconfig := PalaceMgr().GetMaidConfig(id)
	if len(maidsconfig) == 0 {
		user.SendNotify("没有女仆配置")
		return 3,items,nil,gold
	}
	palaceopend := false
	for _, v := range palace.maids {
		palaceopend = (palaceopend || v)
		if palaceopend {
			break
		}
	}
	if !palaceopend {
		user.SendNotify("尚未解锁侍女")
		return 5,items,nil,gold
	}
	if palace.endtime > uint64(util.CURTIME()) {
		user.SendNotify("时间还未到")
		return 4,items,nil,gold
	}
	//可以收取了 根据宫女计算金币和物品吧
	goldObj := make(map[uint32]uint32)
	for i, v := range maidsconfig {
		if i >= len(palace.maids) {
			continue
		}
		if !palace.maids[i] {
			continue
		}
		//这个宫女开启了
		//计算金币
		addition, _ := user.ParseBigGoldToObj(v.GoldAddition)
		addition = user.TimesBigGold(addition,uint32(mastertmpl.WaitTime))
		goldObj = user.MergeBigGold(goldObj, addition)
		rand := uint32(util.RandBetween(0, 9999))
		if rand <= v.ItemProb {
			//获得物品
			weight := uint32(util.RandBetween(0, int32(v.TotalWeight - 1)))
			for _, item := range v.ItemGroup {
				if weight < item.num {
					//就是这个
					items = append(items, &msg.PairNumItem{ Itemid: pb.Uint32(item.id), Num: pb.Uint64(1)})
					break
				}
				weight = weight - item.num
			}
		}
	}
	//TODO 加钱 加金币
	for _, v := range items {
		user.AddItem(v.GetItemid(), uint32(v.GetNum()), "后宫收取奖励")
	}
	// 重新计时吧
	palace.endtime = uint64(util.CURTIME()) + uint64(mastertmpl.WaitTime)
	//
	retitems := make([]*msg.PairNumItem,0)
	// retitems = append(retitems, &msg.PairNumItem{ Itemid: pb.Uint32(uint32(tbl.Common.GoldItemID)), Num: pb.Uint64(gold)})
	retitems = append(retitems, items...)
	//计算收取百分比
	goldObj = user.TimesBigGold(goldObj, palace.charm + 100)
	goldObj = user.DivideBigGold(goldObj, 100)

	goldObj = user.CarryBigGold(goldObj, user.MaxIndexBigGold(goldObj))
	return 0, retitems, palace.PackBin(), user.ParseBigGoldToArr(goldObj)
}

//升级
func (this *UserPalace) Levelup(user* GateUser, id uint32) (result uint32, data *msg.PalaceData) {
	palace, find := this.palaces[id]
	if !find {
		user.SendNotify("后宫尚未开启")
		return 1,nil
	}
	palacetmpl := PalaceMgr().GetPalaceConfig(id)
	if palacetmpl == nil {
		user.SendNotify("没有后宫配置")
		return 2,nil
	}
	mastertmpl := PalaceMgr().GetMasterConfig(id, palace.level)
	if mastertmpl == nil {
		user.SendNotify("没有主子配置")
		return 3,nil
	}
	nextmastertmpl := PalaceMgr().GetMasterConfig(id, palace.level + 1)
	if nextmastertmpl == nil {
		user.SendNotify("已经最高级了")
		return 4,nil
	}
	//判断道具是否够呢
	for _, v := range mastertmpl.LevelupCost {
		if user.bag.GetItemNum(v.id) < v.num {
			user.SendNotify(fmt.Sprintf("主位卡牌道具不足"))
			return 5, nil
		}
	}
	//可以升级咯
	palace.level = palace.level + 1
	//重新计算结束时间
	starttime := palace.endtime - uint64(mastertmpl.WaitTime)
	palace.endtime = starttime + uint64(nextmastertmpl.WaitTime)
	//扣除道具
	for _, v := range mastertmpl.LevelupCost {
		user.RemoveItem(v.id, v.num, "升级后宫消耗")
	}
	return 0, palace.PackBin()
}

//解锁
func (this *UserPalace) UnlockMaid(user* GateUser, id uint32, index uint32) (result uint32, data *msg.PalaceData) {
	palace, find := this.palaces[id]
	if !find {
		user.SendNotify("后宫尚未开启")
		return 1,nil
	}
	palacetmpl := PalaceMgr().GetPalaceConfig(id)
	if palacetmpl == nil {
		user.SendNotify("没有后宫配置")
		return 2,nil
	}
	palacemaidstmpls := PalaceMgr().GetMaidConfig(id)
	if palacemaidstmpls == nil {
		user.SendNotify("没有宫女配置")
		return 3,nil
	}
	if index >= uint32(len(palacemaidstmpls)) {
		user.SendNotify("没有这个槽位")
		return 3,nil
	}
	palacemaidtmpl := palacemaidstmpls[index]
	if palacemaidtmpl == nil {
		user.SendNotify("没有这个槽位")
		return 3,nil
	}
	if palacemaidtmpl.OpenLevel > palace.level {
		user.SendNotify("宫殿等级不够")
		return 4,nil
	}
	if palace.maids[index] {
		user.SendNotify("该槽位已经解锁")
		return 5,nil
	}
	//钱就前端判断了
	palace.maids[index] = true
	return 0, palace.PackBin()
}

//升级部件
func (this *UserPalace) PartLevelup(user *GateUser,id uint32, index uint32) (result uint32, data *msg.PalaceData){
	if index < PalacePartType_Start || index >= PalacepartType_End {
		user.SendNotify("后宫没有该配件")
		return 1, nil
	}
	partid := this.GetPalacePartId(id, index)
	if partid == 0 {
		user.SendNotify("后宫没有该配件")
		return 1, nil
	}
	palace, _ := this.palaces[id]
	if palace == nil {
		user.SendNotify("后宫尚未开启")
		return 2, nil
	}
	level := palace.parts[index]
	curtmpl := PalaceMgr().GetPartConfig(palace.id, level)
	if curtmpl == nil {
		user.SendNotify("未找到配件配置")
		return 3, nil
	} 
	if len(curtmpl.Cost) == 0 {
		user.SendNotify("该配件已满级")
		return 4, nil
	}
	nexttmpl := PalaceMgr().GetPartConfig(palace.id, level + 1)
	if nexttmpl == nil {
		user.SendNotify("该配件已满级")
		return 4, nil
	}
	//可以了 价格啥的就客户端判断了
	palace.parts[index] = level + 1
	palace.charm = this.CalculateCharm(user, id)
	return 0, palace.PackBin()
}
// ========================= 数据处理 ========================= 
// 添加后宫
func (this *UserPalace) AddPalace(user *GateUser, id uint32) (palace *PalaceData, add bool) {
	tmpl := PalaceMgr().GetPalaceConfig(id)
	if tmpl == nil {
		return nil,false
	}
	palace, ok := this.palaces[id];
	if ok {
		return palace, false
	}
	palace = &PalaceData{}
	palace.id = id
	palace.level = 1
	palace.maids = make([]bool, 0)
	for i := 0;i < len(tmpl.Maids); i++ {
		palace.maids = append(palace.maids, false)
	}
	palace.endtime = uint64(util.CURTIME())
	palace.parts = make([]uint32, 0)
	for i := PalacePartType_Start; i < PalacepartType_End; i++ {
		palace.parts = append(palace.parts, 1)
	}
	palace.charm = 0
	return palace, true
}

// 查询后宫部件id 
func (this *UserPalace) GetPalacePartId(id uint32, index uint32) uint32 {
	palace, _ := this.palaces[id];
	if palace == nil {
		return 0
	}
	tmpl := PalaceMgr().GetPalaceConfig(palace.id)
	if tmpl == nil {
		return 0
	}
	if index >= uint32(len(tmpl.Parts)) {
		return 0
	}
	return tmpl.Parts[index]
}
// 重新计算后宫魅力
func (this *UserPalace) CalculateCharm(user *GateUser, id uint32) uint32{
	palace, _ := this.palaces[id];
	if palace == nil {
		return 0
	}
	charm := uint32(0)
	for i, v := range palace.parts {
		partid := this.GetPalacePartId(id, uint32(i))
		if partid != 0 {
			partconf := PalaceMgr().GetPartConfig(partid, v)
			if partconf != nil {
				charm = charm + partconf.Charm
			}
		}
	}
	return charm
}
