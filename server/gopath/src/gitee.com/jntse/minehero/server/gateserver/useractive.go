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
func (this *GateUser) AddReward(rtype uint32, rid uint32 ,rvalue uint32,reason string,notify bool) uint32 { 
	switch rtype {
		case 1:
			//金币
			return 0
		case 2:
			//体力
			this.AddPower(rvalue, reason, true,notify)
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
			//道具
			this.AddItem(rid, rvalue, reason)
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
	log.Info("总权重 %d",totalWeight)
	//随机吧
	result = uint32(util.RandBetween(0, int32(totalWeight) - 1))
	var findbrand *table.TurnBrandDefine
	for _, v := range brands {
		log.Info("当前牌子 id: %d 权重: %d  当前权重 : %d",v.Id,v.Weight,result)
		if result < v.Weight {
			//找到了
			findbrand = v
			break
		}
		result = result - v.Weight
	}
	if findbrand == nil {
		this.SendNotify("未随机到牌子")
		return 2,0
	}
	//扣体力
	this.RemovePower(1,"翻牌子消耗")
	result = this.AddReward(findbrand.Type, findbrand.RewardId, findbrand.Value, "翻牌子奖励", false)
	return result, findbrand.Id
}

//连连看
func (this *GateUser) Linkup(score uint32) (gold uint64){
	//先来简单的，把接口写好
	return uint64(score) * 30000
}
