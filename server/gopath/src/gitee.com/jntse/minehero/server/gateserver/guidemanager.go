package main

import (
	"gitee.com/jntse/minehero/server/tbl"
)
const (
	Type_None			uint32 = 0
	Type_Level   		uint32 = 1
	Type_Guide			uint32 = 2
)

/*
 0->0->0->0->0
 |  |  |  |  |
 V  V  V  V  V
 0	0  0  0  0
 |  |  |  |  
 V  V  V  V
 0  0  0  0
	|  |  |
	V  V  V
	0  0  0
	|
	V
	0
*/

type GuideConf struct {
	id				uint32
	condtype 		uint32
	condvalue 		uint32
	resetid			uint32
	nextid 			uint32
}

//引导管理器
type GuideManager struct {
	guidesMap			map[uint32]*GuideConf
	startGuide			[]uint32
}

func (this *GuideManager) Init() {
	this.guidesMap = make(map[uint32]*GuideConf)
	this.startGuide = make([]*GuideConf, 0)
	for _, v := range tbl.TGuide.Guide {
		conf := &GuideConf{}
		conf.id = v.Id
		conf.condtype = v.ConditionType
		conf.condvalue = v.ConditionValue
		conf.resetid = v.Resetid
		conf.nextid = v.NextId
		if conf.condtype != Type_Guide {
			this.startGuide = append(this.startGuide, conf)
		}
		this.guidesMap[conf.id] = conf
	}
}

func (this *GuideManager) GetGuideById(id uint32) *GuideConf{
	v, _ := this.guidesMap[id]
	return v
}

func (this *GuideManager) IsGuideGroupComplete(id uint32) bool {
	guideConf := this.GetGuideById(id)
	if guideConf == nil {
		return false
	}
	return guideConf.nextid == 0
}

func (this *GuideManager) GetNextGuide(id uint32) uint32{
	guideConf := this.GetGuideById(id)
	if guideConf == nil {
		return 0
	}
	return guideConf.nextid
}
