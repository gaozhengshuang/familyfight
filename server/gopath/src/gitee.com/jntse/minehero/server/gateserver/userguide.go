package main
import (
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/gotoolkit/log"
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
	curguide        uint32
}
//加载数据
func (this *UserGuide) LoadBin(user *GateUser,bin *msg.Serialize) {
	this.guides = make([]uint32, 0)
	guides := bin.GetGuidesdata()
	for _, data := range guides {
		this.guides = append(this.guides, data)
	}
	this.curguide = bin.GetCurguide()
}

func (this *UserGuide) PackBin(bin *msg.Serialize) {
	bin.Guidesdata = make([]uint32, 0)
	for _, guide := range this.guides {
		bin.Guidesdata = append(bin.Guidesdata, guide)
	}
	bin.Curguide = pb.Uint32(this.curguide)
}
// ========================= 对外接口 ========================= 
func (this *UserGuide) Syn(user* GateUser) {
	nextid := this.GetNextGuide(user, true, Type_Level, user.maid.GetMaxId())
	send := &msg.GW2C_AckGuideData{ Guide: pb.Uint32(nextid) }
	user.SendMsg(send)
	this.PushGuideData(user)
}
func (this *UserGuide) IsGuidePass(id uint32) bool {
	for _, v := this.guides {
		if v == id {
			return true
		}
	}
	return false
}
// ========================= 消息接口 =========================
func (this *UserGuide) UpdateGuide(user* GateUser,id uint32) uint32 {
	if !this.IsGuidePass(id){
		this.guides = append(this.guides, id)
		this.PushGuideData(user)
	}
	this.curguide = id
	return this.GetNextGuide(user, false, Type_NonActive, id)
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

func (this *UserGuide) UnFinishGuide(reset bool) uint32 {
	guideConf := GuideMgr().GetGuideById(this.curguide)
	if guideConf == nil {
		return 0
	}
	//未完成
	if reset {
		return guideConf.resetid
	} else {
		return guideConf.nextid
	}
	return 0
}

func (this *UserGuide) NewGuide(trigtype uint32, trigvalue uint32) uint32 {
	for _, v := range GuideMgr().startGuide {
		if !this.IsGuidePass(v) {
			guideConf := GuideMgr().GetGuideById(v)
			if this.CanTrigGuide(guideConf, trigtype, trigvalue) {
				return v
			}
		}
	}
	return 0
}

func (this *UserGuide) PushGuideData(user *GateUser){
	send := &msg.GW2C_PushGuideData{ Guides: make([]uint32, 0) }
	for _, v := range this.guides {
		send.Guides = append(send.Guides, v)
	}
	user.SendMsg(send);
}
