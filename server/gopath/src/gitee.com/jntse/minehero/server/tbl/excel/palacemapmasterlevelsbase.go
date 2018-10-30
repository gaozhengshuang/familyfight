// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10
// DO NOT EDIT!!
package table

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
)

// Defined in table: TPalaceMapMasterLevelsBase
type TPalaceMapMasterLevelsBase struct {

	//PalaceMapMasterLevels
	PalaceMapMasterLevels []*PalaceMapMasterLevelsDefine
}

// Defined in table: PalaceMapMasterLevels
type PalaceMapMasterLevelsDefine struct {

	//id
	Id uint32 `json:"id"`

	//主人id
	MasterId uint32

	//等级
	Level uint32

	//升级消耗道具
	LevelupCost []string

	//等待时间(秒)
	WaitTime uint32

	//品级名称
	levelName string
}

// 添加init初始实例 "Add By Tse"
var InsTPalaceMapMasterLevelsBaseTable *TPalaceMapMasterLevelsBaseTable

func init() {
	InsTPalaceMapMasterLevelsBaseTable = NewTPalaceMapMasterLevelsBaseTable()
}

// 添加Reload方法 "Add By Tse"
func (self *TPalaceMapMasterLevelsBaseTable) Reload() error {
	return self.Load(self.configfile)
}

// TPalaceMapMasterLevelsBase 访问接口
type TPalaceMapMasterLevelsBaseTable struct {

	// 表格原始数据
	TPalaceMapMasterLevelsBase

	// 索引函数表
	indexFuncByName map[string][]func(*TPalaceMapMasterLevelsBaseTable) error

	// 清空函数表
	clearFuncByName map[string][]func(*TPalaceMapMasterLevelsBaseTable) error

	// 加载前回调
	preFuncList []func(*TPalaceMapMasterLevelsBaseTable) error

	// 加载后回调
	postFuncList []func(*TPalaceMapMasterLevelsBaseTable) error

	PalaceMapMasterLevelsById map[uint32]*PalaceMapMasterLevelsDefine

	// 配置文件
	configfile string
}

// 从json文件加载
func (self *TPalaceMapMasterLevelsBaseTable) Load(filename string) error {
	self.configfile = filename
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	var newTab TPalaceMapMasterLevelsBase

	// 读取
	err = json.Unmarshal(data, &newTab)
	if err != nil {
		return err
	}

	// 所有加载前的回调
	for _, v := range self.preFuncList {
		if err = v(self); err != nil {
			return err
		}
	}

	// 清除前通知
	for _, list := range self.clearFuncByName {
		for _, v := range list {
			if err = v(self); err != nil {
				return err
			}
		}
	}

	// 复制数据
	self.TPalaceMapMasterLevelsBase = newTab

	// 生成索引
	for _, list := range self.indexFuncByName {
		for _, v := range list {
			if err = v(self); err != nil {
				return err
			}
		}
	}

	// 所有完成时的回调
	for _, v := range self.postFuncList {
		if err = v(self); err != nil {
			return err
		}
	}

	return nil
}

// 注册外部索引入口, 索引回调, 清空回调
func (self *TPalaceMapMasterLevelsBaseTable) RegisterIndexEntry(name string, indexCallback func(*TPalaceMapMasterLevelsBaseTable) error, clearCallback func(*TPalaceMapMasterLevelsBaseTable) error) {

	indexList, _ := self.indexFuncByName[name]
	clearList, _ := self.clearFuncByName[name]

	if indexCallback != nil {
		indexList = append(indexList, indexCallback)
	}

	if clearCallback != nil {
		clearList = append(clearList, clearCallback)
	}

	self.indexFuncByName[name] = indexList
	self.clearFuncByName[name] = clearList
}

// 注册加载前回调
func (self *TPalaceMapMasterLevelsBaseTable) RegisterPreEntry(callback func(*TPalaceMapMasterLevelsBaseTable) error) {

	self.preFuncList = append(self.preFuncList, callback)
}

// 注册所有完成时回调
func (self *TPalaceMapMasterLevelsBaseTable) RegisterPostEntry(callback func(*TPalaceMapMasterLevelsBaseTable) error) {

	self.postFuncList = append(self.postFuncList, callback)
}

// 创建一个TPalaceMapMasterLevelsBase表读取实例
func NewTPalaceMapMasterLevelsBaseTable() *TPalaceMapMasterLevelsBaseTable {
	return &TPalaceMapMasterLevelsBaseTable{

		indexFuncByName: map[string][]func(*TPalaceMapMasterLevelsBaseTable) error{

			"PalaceMapMasterLevels": {func(tab *TPalaceMapMasterLevelsBaseTable) error {

				// PalaceMapMasterLevels
				for _, def := range tab.PalaceMapMasterLevels {

					if _, ok := tab.PalaceMapMasterLevelsById[def.Id]; ok {
						panic(fmt.Sprintf("duplicate index in PalaceMapMasterLevelsById: %v", def.Id))
					}

					tab.PalaceMapMasterLevelsById[def.Id] = def

				}

				return nil
			}},
		},

		clearFuncByName: map[string][]func(*TPalaceMapMasterLevelsBaseTable) error{

			"PalaceMapMasterLevels": {func(tab *TPalaceMapMasterLevelsBaseTable) error {

				// PalaceMapMasterLevels

				tab.PalaceMapMasterLevelsById = make(map[uint32]*PalaceMapMasterLevelsDefine)

				return nil
			}},
		},

		PalaceMapMasterLevelsById: make(map[uint32]*PalaceMapMasterLevelsDefine),
	}
}
