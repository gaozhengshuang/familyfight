// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10
// DO NOT EDIT!!
package table

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
)

// Defined in table: TDateRewardBase
type TDateRewardBase struct {

	//DateReward
	DateReward []*DateRewardDefine
}

// Defined in table: DateReward
type DateRewardDefine struct {

	//唯一id
	Id uint32 `json:"id"`

	//关卡
	Level uint32

	//时间
	Time uint32

	//地点
	Place uint32

	//事情
	Event uint32

	//奖励
	Reward uint32
}

// 添加init初始实例 "Add By Tse"
var InsTDateRewardBaseTable *TDateRewardBaseTable

func init() {
	InsTDateRewardBaseTable = NewTDateRewardBaseTable()
}

// 添加Reload方法 "Add By Tse"
func (self *TDateRewardBaseTable) Reload() error {
	return self.Load(self.configfile)
}

// TDateRewardBase 访问接口
type TDateRewardBaseTable struct {

	// 表格原始数据
	TDateRewardBase

	// 索引函数表
	indexFuncByName map[string][]func(*TDateRewardBaseTable) error

	// 清空函数表
	clearFuncByName map[string][]func(*TDateRewardBaseTable) error

	// 加载前回调
	preFuncList []func(*TDateRewardBaseTable) error

	// 加载后回调
	postFuncList []func(*TDateRewardBaseTable) error

	DateRewardById map[uint32]*DateRewardDefine

	// 配置文件
	configfile string
}

// 从json文件加载
func (self *TDateRewardBaseTable) Load(filename string) error {
	self.configfile = filename
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	var newTab TDateRewardBase

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
	self.TDateRewardBase = newTab

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
func (self *TDateRewardBaseTable) RegisterIndexEntry(name string, indexCallback func(*TDateRewardBaseTable) error, clearCallback func(*TDateRewardBaseTable) error) {

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
func (self *TDateRewardBaseTable) RegisterPreEntry(callback func(*TDateRewardBaseTable) error) {

	self.preFuncList = append(self.preFuncList, callback)
}

// 注册所有完成时回调
func (self *TDateRewardBaseTable) RegisterPostEntry(callback func(*TDateRewardBaseTable) error) {

	self.postFuncList = append(self.postFuncList, callback)
}

// 创建一个TDateRewardBase表读取实例
func NewTDateRewardBaseTable() *TDateRewardBaseTable {
	return &TDateRewardBaseTable{

		indexFuncByName: map[string][]func(*TDateRewardBaseTable) error{

			"DateReward": {func(tab *TDateRewardBaseTable) error {

				// DateReward
				for _, def := range tab.DateReward {

					if _, ok := tab.DateRewardById[def.Id]; ok {
						panic(fmt.Sprintf("duplicate index in DateRewardById: %v", def.Id))
					}

					tab.DateRewardById[def.Id] = def

				}

				return nil
			}},
		},

		clearFuncByName: map[string][]func(*TDateRewardBaseTable) error{

			"DateReward": {func(tab *TDateRewardBaseTable) error {

				// DateReward

				tab.DateRewardById = make(map[uint32]*DateRewardDefine)

				return nil
			}},
		},

		DateRewardById: make(map[uint32]*DateRewardDefine),
	}
}
