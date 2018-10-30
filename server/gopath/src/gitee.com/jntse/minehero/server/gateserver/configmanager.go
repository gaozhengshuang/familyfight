package main

import (
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/server/tbl/excel"
	"strings"
	"strconv"
)

const (
	PalacePartType_Start 			uint32 = 0
	PalacePartType_PingFeng 		uint32 = 0
	PalacePartType_DengLong 		uint32 = 1
	PalacePartType_LanChuan			uint32 = 2
	PalacePartType_KeYi				uint32 = 3
	PalacePartType_DiTan			uint32 = 4
	PalacepartType_End 				uint32 = 5
)

type IdAndNumber struct {
	id				uint32
	num 			uint32
}

type PalaceMasterConf struct {
	Id				uint32
	Level 			uint32
	WaitTime 		uint32
	LevelupCost 	[]*IdAndNumber
}

type PalaceMaidConf struct {
	Id				uint32
	OpenLevel 		uint32
	GoldAddition 	[]string
	ItemProb 		uint32
	ItemGroup 		[]*IdAndNumber
	TotalWeight 	uint32
}
type PalacePartConf struct {
	Id 				uint32
	Level 			uint32
	Cost 			[]string
	Charm			uint32
}
//后宫管理器
type ConfigManager struct {
	palacetmpls     	map[uint32]*table.PalaceMapDefine
	mastertmpls 		map[uint32]map[uint32]*PalaceMasterConf
	maidtmpls			map[uint32][]*PalaceMaidConf
	parttmpls  			map[uint32]map[uint32]*PalacePartConf

	levelmaidttmpls 	map[uint32][]*table.TMaidLevelDefine
	chapterlevels 		map[uint32][]uint32
}

func (this *ConfigManager) Init() {
	this.palacetmpls = make(map[uint32]*table.PalaceMapDefine)
	this.mastertmpls = make(map[uint32]map[uint32]*PalaceMasterConf)
	this.maidtmpls = make(map[uint32][]*PalaceMaidConf)
	this.parttmpls = make(map[uint32]map[uint32]*PalacePartConf)
	this.levelmaidttmpls = make(map[uint32][]*table.TMaidLevelDefine)
	this.chapterlevels = make(map[uint32][]uint32)
	for _, v := range tbl.TPalaceMapBase.PalaceMap {
		this.palacetmpls[v.Id] = v
		//处理主子配置
		mastertmpls := make(map[uint32]*PalaceMasterConf)
		for _, mv := range tbl.TPalaceMapMasterLevelsBase.PalaceMapMasterLevels {
			if mv.MasterId == v.Master {
				conf := &PalaceMasterConf{}
				conf.Id = mv.MasterId
				conf.Level = mv.Level
				conf.WaitTime = mv.WaitTime
				conf.LevelupCost = make([]*IdAndNumber, 0)
				for _, cost := range mv.LevelupCost {
					infos := strings.Split(cost, "_")
					if len(infos) >= 2 {
						id, _ := strconv.ParseInt(infos[0],10,32)
						count, _ := strconv.ParseInt(infos[1],10,32)
						conf.LevelupCost = append(conf.LevelupCost,&IdAndNumber{id:uint32(id),num:uint32(count)})
					}
				}
				mastertmpls[mv.Level] = conf
			}
		}
		this.mastertmpls[v.Id] = mastertmpls
		//处理宫女配置
		maidtmpls := make([]*PalaceMaidConf, 0)
		for _, maidid := range v.Maids {
			maidtmpl, _ := tbl.TPalaceMapMaidBase.PalaceMapMaidById[maidid]
			if maidtmpl != nil {
				conf := &PalaceMaidConf{}
				conf.Id = maidtmpl.Id
				conf.OpenLevel = maidtmpl.OpenLevel
				conf.GoldAddition = maidtmpl.GoldAddition[:]
				conf.ItemProb = maidtmpl.ItemProb
				conf.ItemGroup = make([]*IdAndNumber, 0)
				conf.TotalWeight = 0
				for _, item := range maidtmpl.ItemGroup   {
					infos := strings.Split(item, "_")
					if len(infos) >= 2 {
						id, _:= strconv.ParseInt(infos[0],10,32)
						weight, _ := strconv.ParseInt(infos[1],10,32)
						conf.TotalWeight = conf.TotalWeight + uint32(weight)
						conf.ItemGroup = append(conf.ItemGroup, &IdAndNumber{id: uint32(id), num: uint32(weight)})
					}
				}
				maidtmpls = append(maidtmpls, conf)
			}
		}
		this.maidtmpls[v.Id] = maidtmpls
	}

	for _, v := range tbl.TPalacePartBase.PalacePartsById {
		partconf := &PalacePartConf{}
		partconf.Id = v.PartId
		partconf.Level = v.Level
		partconf.Cost = v.Cost[:]
		partconf.Charm = v.Charm
		partgroup, find := this.parttmpls[partconf.Id]
		if !find {
			partgroup = make(map[uint32]*PalacePartConf)
			this.parttmpls[partconf.Id] = partgroup
		}
		partgroup[partconf.Level] = partconf
	}
	// 侍女配置
	for _, v := range tbl.TMaidLevelBase.TMaidLevel {
		maidgroup, find := this.levelmaidttmpls[uint32(v.Passlevels)]
		if !find {
			maidgroup = make([]*table.TMaidLevelDefine, 0)
			this.levelmaidttmpls[uint32(v.Passlevels)] = maidgroup
		}
		maidgroup = append(maidgroup, v)
	}
	//关卡配置
	for _, v := range tbl.TPassLevelsBase.PassLevels {
		levelgroup, find := this.chapterlevels[uint32(v.ChapterID)]
		if !find {
			levelgroup = make([]uint32, 0)
			this.chapterlevels[uint32(v.ChapterID)] = levelgroup
		}
		levelgroup = append(levelgroup, v.Id)
	}
}

// 获得后宫的配置
func (this *ConfigManager) GetPalaceConfig(pid uint32) *table.PalaceMapDefine{
	tmpl, _ := this.palacetmpls[pid]
	return tmpl
}
// 获得后宫主子的配置
func (this *ConfigManager) GetMasterConfig(pid uint32, level uint32) *PalaceMasterConf {
	masters, find := this.mastertmpls[pid]
	if !find {
		return nil
	}
	tmpl, _ := masters[level]
	return tmpl
}
//获得后宫宫女的配置
func (this *ConfigManager) GetMaidConfig(pid uint32 ) []*PalaceMaidConf {
	maids, _ := this.maidtmpls[pid]
	return maids
}
//获得后宫部件配置
func (this *ConfigManager) GetPartConfig(pid uint32, level uint32) *PalacePartConf {
	parts, find := this.parttmpls[pid]
	if !find {
		return nil
	}
	tmpl, _ := parts[level]
	return tmpl
}

//获得一个关卡最后一个侍女
func (this *ConfigManager) GetLastMaidByLevel(level uint32) *table.TMaidLevelDefine {
	maidgroup, find := this.levelmaidttmpls[level]
	if !find {
		return nil
	}
	if len(maidgroup) > 0 {
		return maidgroup[len(maidgroup) - 1]
	} else {
		return nil
	}
}
//获得一个章节的所有关卡
func (this *ConfigManager) GetLevelsByChapter(chapter uint32) []uint32 {
	levelgroup, find := this.chapterlevels[chapter]
	if find {
		return levelgroup
	} else {
		return make([]uint32, 0)
	}
}
