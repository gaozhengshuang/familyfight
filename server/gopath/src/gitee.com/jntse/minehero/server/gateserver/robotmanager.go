package main
import (
	"fmt"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	pb "github.com/golang/protobuf/proto"
)

// --------------------------------------------------------------------------
/// @brief 机器人数据
// --------------------------------------------------------------------------
type RobotData struct {
	id 					uint64
	name				string
	face				string
	palaces				map[uint32]* PalaceData
}

type RobotManager struct {
	robots 				[]*RobotData
	generateTime 		uint64
}

func (this* RobotManager) Init(){
	this.GenerateRobotPool(uint32(tbl.Common.RobotCount))
}

func (this* RobotManager) GenerateRobotPool(count uint32){
	this.generateTime = uint64(util.CURTIME())
	this.robots = make([]*RobotData, 0)
	//在线玩家中选 1/5 其他的是机器人
	userlen := int32(len(UserMgr().ids))
	playerCount := userlen / 5
	indexs := util.SelectRandNumbers(playerCount, userlen)
	index := int32(0)
	
}