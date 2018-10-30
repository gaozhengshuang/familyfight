// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10
// DO NOT EDIT!!
package table

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
)

// Defined in table: TGuide
type TGuide struct {

	//Guide
	Guide []*GuideDefine
}

// Defined in table: Guide
type GuideDefine struct {

	//引导id
	Id uint32 `json:"id"`

	//上一步id
	Resetid uint32

	//下一步id
	NextId uint32

	//（1指向位置固定2点空地结束3轿子4仆人5空白）
	Type uint32

	//（0无对话，1有对话）
	IsDialog uint32

	//（0无手指，1有手指）
	IsFinger uint32

	//谈话内容
	Dialog string

	//预制路径（例：Prefab/GameSceneView)
	prefab string

	//配谁亮谁（例：view）
	ViewName string

	//点击目标名字（例：btn_shop)
	ButtonName string

	//人物坐标显示
	PersonXY string

	//手指坐标
	FingerXY string

	//仆人id_仆人数量
	MaidInfo string

	//条件类型 0无条件引导 1 关卡解锁 2 不主动触发
	ConditionType uint32

	//条件值
	ConditionValue uint32
}

// 添加init初始实例 "Add By Tse"
var InsTGuideTable *TGuideTable

func init() {
	InsTGuideTable = NewTGuideTable()
}

// 添加Reload方法 "Add By Tse"
func (self *TGuideTable) Reload() error {
	return self.Load(self.configfile)
}

// TGuide 访问接口
type TGuideTable struct {

	// 表格原始数据
	TGuide

	// 索引函数表
	indexFuncByName map[string][]func(*TGuideTable) error

	// 清空函数表
	clearFuncByName map[string][]func(*TGuideTable) error

	// 加载前回调
	preFuncList []func(*TGuideTable) error

	// 加载后回调
	postFuncList []func(*TGuideTable) error

	GuideById map[uint32]*GuideDefine

	// 配置文件
	configfile string
}

// 从json文件加载
func (self *TGuideTable) Load(filename string) error {
	self.configfile = filename
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	var newTab TGuide

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
	self.TGuide = newTab

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
func (self *TGuideTable) RegisterIndexEntry(name string, indexCallback func(*TGuideTable) error, clearCallback func(*TGuideTable) error) {

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
func (self *TGuideTable) RegisterPreEntry(callback func(*TGuideTable) error) {

	self.preFuncList = append(self.preFuncList, callback)
}

// 注册所有完成时回调
func (self *TGuideTable) RegisterPostEntry(callback func(*TGuideTable) error) {

	self.postFuncList = append(self.postFuncList, callback)
}

// 创建一个TGuide表读取实例
func NewTGuideTable() *TGuideTable {
	return &TGuideTable{

		indexFuncByName: map[string][]func(*TGuideTable) error{

			"Guide": {func(tab *TGuideTable) error {

				// Guide
				for _, def := range tab.Guide {

					if _, ok := tab.GuideById[def.Id]; ok {
						panic(fmt.Sprintf("duplicate index in GuideById: %v", def.Id))
					}

					tab.GuideById[def.Id] = def

				}

				return nil
			}},
		},

		clearFuncByName: map[string][]func(*TGuideTable) error{

			"Guide": {func(tab *TGuideTable) error {

				// Guide

				tab.GuideById = make(map[uint32]*GuideDefine)

				return nil
			}},
		},

		GuideById: make(map[uint32]*GuideDefine),
	}
}
