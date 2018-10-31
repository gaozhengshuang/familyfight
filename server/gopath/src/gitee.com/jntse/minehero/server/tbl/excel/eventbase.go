// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10
// DO NOT EDIT!!
package table

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
)

// Defined in table: TEventBase
type TEventBase struct {

	//Event
	Event []*EventDefine
}

// Defined in table: Event
type EventDefine struct {

	//id
	Id uint32 `json:"id"`

	//事件名称
	EventName string

	//事件图片路径
	EventPath string

	//默认弹幕 头像_内容
	DefaultBarrage []string
}

// 添加init初始实例 "Add By Tse"
var InsTEventBaseTable *TEventBaseTable

func init() {
	InsTEventBaseTable = NewTEventBaseTable()
}

// 添加Reload方法 "Add By Tse"
func (self *TEventBaseTable) Reload() error {
	return self.Load(self.configfile)
}

// TEventBase 访问接口
type TEventBaseTable struct {

	// 表格原始数据
	TEventBase

	// 索引函数表
	indexFuncByName map[string][]func(*TEventBaseTable) error

	// 清空函数表
	clearFuncByName map[string][]func(*TEventBaseTable) error

	// 加载前回调
	preFuncList []func(*TEventBaseTable) error

	// 加载后回调
	postFuncList []func(*TEventBaseTable) error

	EventById map[uint32]*EventDefine

	// 配置文件
	configfile string
}

// 从json文件加载
func (self *TEventBaseTable) Load(filename string) error {
	self.configfile = filename
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	var newTab TEventBase

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
	self.TEventBase = newTab

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
func (self *TEventBaseTable) RegisterIndexEntry(name string, indexCallback func(*TEventBaseTable) error, clearCallback func(*TEventBaseTable) error) {

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
func (self *TEventBaseTable) RegisterPreEntry(callback func(*TEventBaseTable) error) {

	self.preFuncList = append(self.preFuncList, callback)
}

// 注册所有完成时回调
func (self *TEventBaseTable) RegisterPostEntry(callback func(*TEventBaseTable) error) {

	self.postFuncList = append(self.postFuncList, callback)
}

// 创建一个TEventBase表读取实例
func NewTEventBaseTable() *TEventBaseTable {
	return &TEventBaseTable{

		indexFuncByName: map[string][]func(*TEventBaseTable) error{

			"Event": {func(tab *TEventBaseTable) error {

				// Event
				for _, def := range tab.Event {

					if _, ok := tab.EventById[def.Id]; ok {
						panic(fmt.Sprintf("duplicate index in EventById: %v", def.Id))
					}

					tab.EventById[def.Id] = def

				}

				return nil
			}},
		},

		clearFuncByName: map[string][]func(*TEventBaseTable) error{

			"Event": {func(tab *TEventBaseTable) error {

				// Event

				tab.EventById = make(map[uint32]*EventDefine)

				return nil
			}},
		},

		EventById: make(map[uint32]*EventDefine),
	}
}