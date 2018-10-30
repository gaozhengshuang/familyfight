package main
import (
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/server/tbl"
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

func (this *RobotData) RandomPalace() *PalaceData {
	if len(this.palaces) == 0 {
		return nil
	}
	targetindex := util.RandBetween(0, int32(len(this.palaces) - 1))
	index := int32(0)
	for _, v := range this.palaces {
		if index == targetindex {
			return v
		}
		index = index + 1
	}
	return nil
}

type RobotManager struct {
	robots 				[]*RobotData
	generateTime 		uint64
}

func (this* RobotManager) Init(){
	this.GenerateRobotPool(uint32(tbl.Common.RobotCount))
}

func (this *RobotManager) Tick1Minite(now uint64) {
	if this.generateTime + uint64(tbl.Common.RobotGenerateInterval) < now {
		this.GenerateRobotPool(uint32(tbl.Common.RobotCount))
	}
}

func (this *RobotManager) RandomRobot(count int32) []*RobotData{
	robotlen := int32(len(this.robots))
	if count >= robotlen{
		return this.robots
	}
	indexs := util.SelectRandNumbers(robotlen, count)
	ret := make([]*RobotData, 0)
	for _, v := range indexs {
		ret = append(ret, this.robots[v])
	}
	return ret
}

func (this* RobotManager) GenerateRobotPool(count uint32){
	this.generateTime = uint64(util.CURTIME())
	this.robots = make([]*RobotData, 0)
	//在线玩家中选 1/5 其他的是机器人
	userlen := int32(len(UserMgr().ids))
	playerCount := userlen / 5
	indexs := util.SelectRandNumbers(userlen, playerCount)
	for _, v := range indexs {
		id, find := UserMgr().idwithindex[uint32(v)]
		if find {
			user := UserMgr().FindById(id)
			if user != nil && len(user.palace.palaces) > 0 {
				this.robots = append(this.robots, this.GenerateRobotByUser(user))
			}
		}
	}
	randomCount := count - uint32(len(this.robots))
	for i := uint32(0); i < randomCount; i++ {
		this.robots = append(this.robots, this.GenerateRandomRobot())
	}
}

func (this *RobotManager) GenerateRobotByUser(user *GateUser) *RobotData {
	robotdata := &RobotData{}
	robotdata.id = user.Id()
	robotdata.name = user.Name()
	robotdata.face = user.Face()
	robotdata.palaces = make(map[uint32]* PalaceData)
	for _, palace := range user.palace.palaces {
		robotdata.palaces[palace.id]= CopyPalaceData(palace)
	}
	return robotdata
}

func (this *RobotManager) GenerateRandomRobot() *RobotData {
	robotdata := &RobotData{}
	robotdata.id = 0
	robotdata.name = GateSvr().GetRandNickName()
	robotdata.face = ""
	robotdata.palaces = make(map[uint32]* PalaceData)
	for _, palacetmpl := range ConfigMgr().palacetmpls {
		//开启了
		palace := &PalaceData{}
		palace.id = palacetmpl.Id
		palace.level = 1
		palace.maids = make([]bool, 0)
		maidopencount := util.RandBetween(1, int32(len(palacetmpl.Maids)))
		for i := int32(0); i < int32(len(palacetmpl.Maids)); i++ {
			palace.maids = append(palace.maids,i < maidopencount)
		}
		palace.parts = make([]uint32, 0)
		palace.golds = make([]string, 0)
		robotdata.palaces[palacetmpl.Id] = palace
	}
	return robotdata
}
