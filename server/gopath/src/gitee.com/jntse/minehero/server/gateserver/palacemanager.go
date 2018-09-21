package main

import (
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/server/tbl/excel"
	"strings"
	"strconv"
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
	UnlockPrice 	uint32
	GoldAddition 	uint32
	ItemProb 		uint32
	ItemGroup 		[]*IdAndNumber
	TotalWeight 	uint32
}

//后宫管理器
type PalaceManager struct {
	palacetmpls     	map[uint32]*table.PalaceMapDefine
	mastertmpls 		map[uint32]map[uint32]*PalaceMasterConf
	maidtmpls			map[uint32][]*PalaceMaidConf
}

func (this *PalaceManager) Init() {
	this.palacetmpls = make(map[uint32]*table.PalaceMapDefine)
	this.mastertmpls = make(map[uint32]map[uint32]*PalaceMasterConf)
	this.maidtmpls = make(map[uint32][]*PalaceMaidConf)
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
				conf.UnlockPrice = maidtmpl.UnlockPrice
				conf.GoldAddition = maidtmpl.GoldAddition
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
}

// 获得后宫的配置
func (this *PalaceManager) GetPalaceConfig(pid uint32) *table.PalaceMapDefine{
	tmpl, _ := this.palacetmpls[pid]
	return tmpl
}
// 获得后宫主子的配置
func (this *PalaceManager) GetMasterConfig(pid uint32, level uint32) *PalaceMasterConf {
	masters, find := this.mastertmpls[pid]
	if !find {
		return nil
	}
	tmpl, _ := masters[level]
	return tmpl
}
//获得后宫宫女的配置
func (this *PalaceManager) GetMaidConfig(pid uint32 ) []*PalaceMaidConf {
	maids, _ := this.maidtmpls[pid]
	return maids
}
