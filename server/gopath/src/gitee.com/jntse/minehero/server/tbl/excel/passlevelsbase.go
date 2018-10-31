// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10
// DO NOT EDIT!!
package table

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
)

// Defined in table: TPassLevelsBase
type TPassLevelsBase struct {

	//PassLevels
	PassLevels []*PassLevelsDefine
}

// Defined in table: PassLevels
type PassLevelsDefine struct {

	//id
	Id uint32 `json:"id"`

	//名字
	Name string

	//图片路径
	Path string

	//下个关卡ID
	NextLevels int32

	//对话ID
	DialogueID int32

	//地图预制
	MapPrefab string

	//章节ID
	ChapterID int32

	//章节名称
	ChapterName string

	//关卡索引
	Index int32
}

// 添加init初始实例 "Add By Tse"
var InsTPassLevelsBaseTable *TPassLevelsBaseTable

func init() {
	InsTPassLevelsBaseTable = NewTPassLevelsBaseTable()
}

// 添加Reload方法 "Add By Tse"
func (self *TPassLevelsBaseTable) Reload() error {
	return self.Load(self.configfile)
}

// TPassLevelsBase 访问接口
type TPassLevelsBaseTable struct {

	// 表格原始数据
	TPassLevelsBase

	// 索引函数表
	indexFuncByName map[string][]func(*TPassLevelsBaseTable) error

	// 清空函数表
	clearFuncByName map[string][]func(*TPassLevelsBaseTable) error

	// 加载前回调
	preFuncList []func(*TPassLevelsBaseTable) error

	// 加载后回调
	postFuncList []func(*TPassLevelsBaseTable) error

	PassLevelsById map[uint32]*PassLevelsDefine

	// 配置文件
	configfile string
}

// 从json文件加载
func (self *TPassLevelsBaseTable) Load(filename string) error {
	self.configfile = filename
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	var newTab TPassLevelsBase

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
	self.TPassLevelsBase = newTab

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
func (self *TPassLevelsBaseTable) RegisterIndexEntry(name string, indexCallback func(*TPassLevelsBaseTable) error, clearCallback func(*TPassLevelsBaseTable) error) {

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
func (self *TPassLevelsBaseTable) RegisterPreEntry(callback func(*TPassLevelsBaseTable) error) {

	self.preFuncList = append(self.preFuncList, callback)
}

// 注册所有完成时回调
func (self *TPassLevelsBaseTable) RegisterPostEntry(callback func(*TPassLevelsBaseTable) error) {

	self.postFuncList = append(self.postFuncList, callback)
}

// 创建一个TPassLevelsBase表读取实例
func NewTPassLevelsBaseTable() *TPassLevelsBaseTable {
	return &TPassLevelsBaseTable{

		indexFuncByName: map[string][]func(*TPassLevelsBaseTable) error{

			"PassLevels": {func(tab *TPassLevelsBaseTable) error {

				// PassLevels
				for _, def := range tab.PassLevels {

					if _, ok := tab.PassLevelsById[def.Id]; ok {
						panic(fmt.Sprintf("duplicate index in PassLevelsById: %v", def.Id))
					}

					tab.PassLevelsById[def.Id] = def

				}

				return nil
			}},
		},

		clearFuncByName: map[string][]func(*TPassLevelsBaseTable) error{

			"PassLevels": {func(tab *TPassLevelsBaseTable) error {

				// PassLevels

				tab.PassLevelsById = make(map[uint32]*PassLevelsDefine)

				return nil
			}},
		},

		PassLevelsById: make(map[uint32]*PassLevelsDefine),
	}
}