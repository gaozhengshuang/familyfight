package main
import (
	"gitee.com/jntse/gotoolkit/log"
	_"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/server/tbl/excel"
	"gitee.com/jntse/gotoolkit/util"
	pb "github.com/golang/protobuf/proto"
	"fmt"
)

// 获得奖励
func (this *GateUser) AddReward(rtype uint32, rid uint32 ,rvalue uint32,reason string) uint32 { 
	switch rtype {
		case 1:
			//金币
			return 0
		case 2:
			//体力
			this.AddPower(rvalue, reason, true)
			return 0
		case 3:
			//侍女
			maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[rid]
			if !find {
				this.SendNotify("没有对应的侍女配置")
				return 1
			}
			count := this.maid.GetMaidCountByLevel(uint32(maidconfg.Passlevels))
			if count >= 20 {
				this.SendNotify("该关卡侍女数量已达上限")
				return 2
			}
			//可以获得了
			maid := this.maid.AddMaid(this,rid,rvalue)
			maidSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
			maidSend.Datas = append(maidSend.Datas, maid.PackBin())
			maidSend.Maxid = pb.Uint32(this.maid.GetMaxId())
			this.SendMsg(maidSend)
			return 0
		case 4:
			//小游戏
			return 0
		case 5:
			//小游戏
			return 0
		default:
			return 0
	}
}

//翻牌子
func (this *GateUser) TurnBrand(ids []uint32) (result uint32, id uint32) {
	// 体力够不够 
	if this.GetPower() < 1 {
		this.SendNotify("体力不足")
		return 1,0
	}
	totalWeight := uint32(0)
	brands := make([]*table.TurnBrandDefine,0)
	for _,v := range ids {
		tmpl, find := tbl.TTurnBrandBase.TurnBrandById[v]
		if !find {
			log.Info("玩家[%d] 翻牌子 没有该牌子配置[%d]", this.Id(), v)
			this.SendNotify(fmt.Sprintf("没有对应的牌子配置 [%d]",id))
			continue
		}
		brands = append(brands, tmpl)
		totalWeight = totalWeight + tmpl.Weight
	}
	//随机吧
	result = util.RandBetween(0, uint32(totalWeight - 1))
	findbrand := *table.TurnBrandDefine(nil)
	for _, v := range brands {
		if result < v.Weight {
			//找到了
			findbrand = v
		}
	}
	if findbrand == nil {
		this.SendNotify("未随机到牌子")
		return 2,0
	}
	result = this.AddReward(findbrand.Type, findbrand.RewardId, findbrand.Value, "翻牌子奖励")
	return result, findbrand.Id
}
