package main
import (
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/golang/protobuf/proto"
)

// --------------------------------------------------------------------------
/// @brief 引导数据
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
/// @brief 玩家引导数据
// --------------------------------------------------------------------------
type UserGuide struct {
	guides			[]uint32
}
//加载数据
func (this *UserGuide) LoadBin(user *GateUser,bin *msg.Serialize) {
	this.guides = make([]uint32, 0)
	guides := bin.GetGuides()
	for _, data := range guides {
		this.guides = append(this.guides, data)
	}
}

func (this *UserGuide) PackBin(bin *msg.Serialize) {
	bin.Guides = make([]uint32, 0)
	for _, guide := range this.guides {
		bin.Guides = append(bin.Guides, guide)
	}
}
// ========================= 对外接口 ========================= 
func (this *UserGuide) Syn(user* GateUser) {
	nextid := this.GetNextGuide(user, true, Type_None, 0)
	send := &msg.GW2C_AckGuideData{ Guide: pb.Uint32(nextid) }
	user.SendMsg(send)
}
func (this *UserGuide) IsGuidePass(id uint32) bool {
	guideConf := GuideMgr().GetGuideById(id)
	if guideConf == nil {
		return false
	}
	for _, v := range this.guides {
		startId, find := GuideMgr().GetStartId(v)
		if find {
			if startId == guideConf.startid {
				//就是这一组
				return v >= id		
			}
		}
	}
	return false
}
// ========================= 消息接口 =========================
func (this *UserGuide) UpdateGuide(user* GateUser,id uint32) uint32 {
	startId, find := GuideMgr().GetStartId(id)
	if !find {
		return 0
	}
	index := -1
	for i, v := range this.guides {
		mystartid, _ := GuideMgr().GetStartId(v)
		if mystartid == startId {
			index = i
			break
		}
	}
	if index == -1 {
		this.guides = append(this.guides, id)
	} else {
		this.guides[index] = id
	}
	return this.GetNextGuide(user, false, Type_Guide, id)
}
func (this *UserGuide) OpenNewLevel(user* GateUser, level uint32) uint32 {
	unfinishGuide := this.UnFinishGuide(false)
	if unfinishGuide != 0 {
		return 0
	}
	return this.NewGuide(Type_Level, level)
}
// ========================= 数据处理 =========================
func (this *UserGuide) GetNextGuide(user* GateUser, reset bool,trigtype uint32, trigvalue uint32) uint32{
	//先看看已经开启的 有没有做完
	unfinishGuide := this.UnFinishGuide(reset)
	if unfinishGuide != 0 {
		return unfinishGuide
	}
	return this.NewGuide(trigtype, trigvalue)
}

func (this *UserGuide) CanTrigGuide(conf *GuideConf, trigtype uint32, trigvalue uint32) bool {
	switch conf.condtype {
		case Type_None:
			return true
		case Type_Level:
			if conf.condtype == trigtype {
				return conf.condvalue == trigvalue
			} else {
				return false
			}
		default:
			return false
	}
}

func (this *UserGuide) CalculateGuideIndex() uint64 {
	guideIndexs := uint64(0)
	for _, v := range this.guides {
		guideConf := GuideMgr().GetGuideById(v)
		guideIndexs = guideIndexs | 1 << guideConf.index
	}
	return guideIndexs
}

func (this *UserGuide) UnFinishGuide(reset bool) uint32 {
	for _, v := range this.guides {
		guideConf := GuideMgr().GetGuideById(v)
		if !GuideMgr().IsGuideGroupComplete(v) {
			//未完成
			if reset {
				return guideConf.resetid
			} else {
				return GuideMgr().GetNextGuide(v)
			}
		}
	}
	return 0
}

func (this *UserGuide) NewGuide(trigtype uint32, trigvalue uint32) uint32 {
	guideIndexs := this.CalculateGuideIndex()
	//没有还在跑的引导，看看未开始的引导中有没有可以开启的
	for i, v := range GuideMgr().guidesConf {
		result := guideIndexs & uint64(1 << uint64(i))
		if result > 0 {
			continue
		}
		firstGuide := v[0]
		if this.CanTrigGuide(firstGuide, trigtype, trigvalue) {
			return firstGuide.id
		}
	}
	return 0
}
