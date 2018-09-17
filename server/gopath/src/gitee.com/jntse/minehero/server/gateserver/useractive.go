package main
import (
	"gitee.com/jntse/gotoolkit/log"
	_"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/gotoolkit/util"
	pb "github.com/golang/protobuf/proto"
	"math"
)

// 获得奖励
func (this *GateUser) AddReward(rtype uint32, rid uint32 rvalue uint32,reason string) uint32   { 
	switch rtype {
		case 1:
			//金币
			return 0
		case 2:
			//体力
			this.AddPower(rvalue, reason, true)
			return 0
			break
		case 3:
			//侍女
			maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[rid]
			if !find {
				user.SendNotify("没有对应的侍女配置")
				return 1
			}
			count := this.maid.GetMaidCountByLevel(uint32(maidconfg.Passlevels))
			if count >= 20 {
				user.SendNotify("该关卡侍女数量已达上限")
				return 2
			}
			//可以获得了
			maid := this.maid.AddMaid(user,rid,rvalue)
			maidSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
			maidSend.Datas = append(maidSend.Datas, maid.PackBin())
			maidSend.Maxid = pb.Uint32(this.maid.GetMaxId())
			user.SendMsg(maidSend)
			break
		case 4:
			//小游戏
			break
		case 5:
			//小游戏
			break
		default:
			return 0
	}
}

//大转盘
func (this *GateUser) TurnBrand(ids []uint32) (result uint32, id uint32) {
	
}
