package main
import (
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/golang/protobuf/proto"
)

// --------------------------------------------------------------------------
/// @brief 后宫数据
// --------------------------------------------------------------------------
type PalaceData struct {
	id				uint32
	level 			uint32
	maids			map[uint32]bool
	endtime			uint64
}

func (this *PalaceData) PackBin() *msg.PalaceData{
	data := &msg.PalaceData{}
	data.Id = pb.Uint32(this.id)
	data.Level = pb.Uint32(this.level)
	for _, v := range this.maids {
		data.Maids = append(data.Maids, pb.Bool(v))
	}
	data.Endtime = pb.Uint64(this.endtime)
	return data
}

// --------------------------------------------------------------------------
/// @brief 玩家侍女
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
		palace := this.AddPalace(user,data.GetId())
		palace.level = data.GetLevel()
		for index, v := range data.GetMaids() {
			palace.maids[index] = v
		}
		palace.endtime = data.GetEndtime()
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
// ========================= 消息接口 =========================
//收取
func (this *UserPalace) TakeBack(user* GateUser, id uint32) (result uint32,gold uint64,items []*msg.PairNumItem, data *msg.PalaceData){
	items := make([]*msg.PairNumItem,0)
	palace, find := this.palaces[id]
	if !find {
		user.SendNotify("后宫尚未开启")
		return 1,0，items,nil
	}
	palacetmpl, ok := TPalaceMapBase.PalaceMapById[id]
	if !ok {
		user.SendNotify("没有后宫配置")
		return 1,0，items,nil
	}
	mastertmpl, ok := TPalaceMapMasterLevelsBase.PalaceMapMasterLevelsById[id]
	if !ok {

	}
	if palace.endtime > uint64(util.CURTIME()) {
		user.SendNotify("时间还未到")
		return 2,0，items,nil
	}
	//可以收取了 根据宫女计算金币和物品吧
	
}
// ========================= 数据处理 ========================= 
// 添加后宫
func (this *UserPalace) AddPalace(user *GateUser, id uint32) *PalaceData {
	tmpl, find := TPalaceMapMasterLevelsBase.PalaceMapMasterLevelsById[id]
	if !find {
		return nil
	}
	palace, ok := this.palaces[id];
	if ok {
		return palace
	}
	palace = &PalaceData{}
	palace.id = id
	palace.level = 0
	palace.maids = make(map[uint32]bool)
	palace.endtime = uint64(util.CURTIME()) + uint64(tmpl.WaitTime)
	this.palaces[id] = palace
	return palace
}

// 获得后宫的配置
func (this *UserPalace) GetPalaceConfig(pid uint32) *table.PalaceMapDefine{
	tmpl, _ := tbl.TPalaceMapBase.PalaceMapById[pid]
	return tmpl
}
// 获得后宫主子的配置
func (this *UserPalace) GetMasterConfig(pid uint32, level uint32) *table.PalaceMapMasterLevelsDefine {
	palacetmpl := this.GetPalaceConfig(pid)
	if palacetmpl == nil {
		return nil
	}
	for _, v := range tbl.TPalaceMapMasterLevelsBase.PalaceMapMasterLevels {
		if v.MasterId == palacetmpl.Master && v.Level == level {
			return v
		}
	}	
	return nil
}
//获得后宫宫女的配置
func (this *UserPalace) GetMaidConfig(pid uint32 ) []*table.PalaceMapMaidDefine {
	palacetmpl := this.GetPalaceConfig(pid)
	ret := make([]*table.PalaceMapMaidDefine, 0)
	if palacetmpl == nil {
		return ret
	}
	for _, v := palacetmpl.Maids {
		maidtmpl, _ := tbl.TPalaceMapMaidBase.PalaceMapMaidById[v]
		if maidtmpl != nil {
			ret = append(ret, maidtmpl)
		}
	}
	return ret
}