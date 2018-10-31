// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10
// DO NOT EDIT!!
package table

import (
	"fmt"
	"encoding/json"
	"io/ioutil"
)

// Defined in table: TPalaceMapBase
type TPalaceMapBase struct {

	//PalaceMap
	PalaceMap []*PalaceMapDefine
}

// Defined in table: PalaceMap
type PalaceMapDefine struct {

	//id
	Id uint32 `json:"id"`

	//宫殿名字
	Name string

	//宫殿匾路径
	BannerPath string

	//解锁关卡（配置关卡ID)
	UlockPassId int32

	//位置显示x
	x int32

	//位置显示y
	y int32

	//头像图片路径
	Headpath string

	//主子的id
	Master uint32

	//女仆id们
	Maids []uint32

	//女仆坐标显示
	MaidsXY []string

	//0 屏风 1 灯笼 2 栏窗 3 客椅 4 地毯
	Parts []uint32
}

// 添加init初始实例 "Add By Tse"
var InsTPalaceMapBaseTable *TPalaceMapBaseTable

func init() {
	InsTPalaceMapBaseTable = NewTPalaceMapBaseTable()
}

// 添加Reload方法 "Add By Tse"
func (self *TPalaceMapBaseTable) Reload() error {
	return self.Load(self.configfile)
}

// TPalaceMapBase 访问接口
type TPalaceMapBaseTable struct {

	// 表格原始数据
	TPalaceMapBase

	// 索引函数表
	indexFuncByName map[string][]func(*TPalaceMapBaseTable) error

	// 清空函数表
	clearFuncByName map[string][]func(*TPalaceMapBaseTable) error

	// 加载前回调
	preFuncList []func(*TPalaceMapBaseTable) error

	// 加载后回调
	postFuncList []func(*TPalaceMapBaseTable) error

	PalaceMapById map[uint32]*PalaceMapDefine

	// 配置文件
	configfile string
}

// 从json文件加载
func (self *TPalaceMapBaseTable) Load(filename string) error {
	self.configfile = filename
	data, err := ioutil.ReadFile(filename)

	if err != nil {
		return err
	}

	var newTab TPalaceMapBase

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
	self.TPalaceMapBase = newTab

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
func (self *TPalaceMapBaseTable) RegisterIndexEntry(name string, indexCallback func(*TPalaceMapBaseTable) error, clearCallback func(*TPalaceMapBaseTable) error) {

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
func (self *TPalaceMapBaseTable) RegisterPreEntry(callback func(*TPalaceMapBaseTable) error) {

	self.preFuncList = append(self.preFuncList, callback)
}

// 注册所有完成时回调
func (self *TPalaceMapBaseTable) RegisterPostEntry(callback func(*TPalaceMapBaseTable) error) {

	self.postFuncList = append(self.postFuncList, callback)
}

// 创建一个TPalaceMapBase表读取实例
func NewTPalaceMapBaseTable() *TPalaceMapBaseTable {
	return &TPalaceMapBaseTable{

		indexFuncByName: map[string][]func(*TPalaceMapBaseTable) error{

			"PalaceMap": {func(tab *TPalaceMapBaseTable) error {

				// PalaceMap
				for _, def := range tab.PalaceMap {

					if _, ok := tab.PalaceMapById[def.Id]; ok {
						panic(fmt.Sprintf("duplicate index in PalaceMapById: %v", def.Id))
					}

					tab.PalaceMapById[def.Id] = def

				}

				return nil
			}},
		},

		clearFuncByName: map[string][]func(*TPalaceMapBaseTable) error{

			"PalaceMap": {func(tab *TPalaceMapBaseTable) error {

				// PalaceMap

				tab.PalaceMapById = make(map[uint32]*PalaceMapDefine)

				return nil
			}},
		},

		PalaceMapById: make(map[uint32]*PalaceMapDefine),
	}
}