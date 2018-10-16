package main

import (
	"gitee.com/jntse/minehero/server/tbl"
)
type GuideCondType uint32
const (
	Type_None			GuideCondType = 0
	Type_Level   		GuideCondType = 1
	Type_Guide			GuideCondType = 2
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
	startid 		uint32		//一列中的一个引导的id
	index 			uint32		//在这一组的哪一个index上
	resetid			uint32
}

//引导管理器
type GuideManager struct {
	guidesConf     		[][]*GuideConf
	guidesMap			map[uint32]*GuideConf
}

func (this *GuideManager) Init() {
	this.guidesConf = make([][]*GuideConf, 0)
	this.guidesMap = make(map[uint32]*GuideConf)
	for _, v := range tbl.TGuide.Guide {
		conf := &GuideConf{}
		conf.id = v.Id
		conf.condtype = v.ConditionType
		conf.condvalue = v.ConditionValue
		conf.resetid = v.Resetid
		this.guidesMap[conf.id] = conf
		switch v.ConditionType {
			case Type_Guide:
				preGuide := this.GetGuideById(conf.condvalue)
				if preGuide != null {
					guideGroup := this.guidesConf[preGuide.index]
					conf.startid = preGuide.startid
					conf.index = preGuide.index
					guideGroup = append(guideGroup, guideGroup)
				}
				break
			default:
				conf.startid = conf.id
				conf.index = len(this.guidesConf)
				guideGroup := make([]*GuideConf, 0)
				guideGroup = append(guideGroup, conf)
				this.guidesConf = append(this.guidesConf, guideGroup)
				break
		}
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
	guideGroup := this.guidesConf[guideConf.index]
	lastGuide := guideGroup[len(guideGroup) - 1]
	return guideConf.id == lastGuide.id
}

func (this *GuideManager) GetNextGuide(id uint32) uint32{
	guideConf := this.GetGuideById(id)
	if guideConf == nil {
		return 0
	}
	guideGroup := this.guidesConf[guideConf.index]
	find := false
	nextid := uint32(0)
	for _, v := range guideGroup {
		if find {
			nextid = v.id
			break
		}
		if v.id == id {
			find = true
		}
	}
	return nextid
}

func (this *GuideManager) GetStartId(id uint32) (result uint32 , find bool){
	guideConf := this.GetGuideById(id)
	if guideConf == nil {
		return 0, false
	}
	return guideConf.startid, true
}
