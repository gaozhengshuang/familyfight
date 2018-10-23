package main
import (
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/pbmsg"
)

// --------------------------------------------------------------------------
/// @brief 
// --------------------------------------------------------------------------
type DropItem struct {
	prop 			uint32

	rewardtype		uint32
	rewardid 		uint32
	rewardvalue 	uint32
}
type DropNode struct {
	id				uint32
	proptype		uint32
	totalprop 		uint32
	items 			[]*DropItem
}

type DropData struct {
	rewardtype 		uint32
	rewardid 		uint32
	rewardvalue 	uint32
}
func GenerateDropData(item *DropItem) *DropData {
	data := &DropData{}
	data.rewardtype = item.rewardtype
	data.rewardid = item.rewardid
	data.rewardvalue = item.rewardvalue
	return data
}

type RewardManager struct {
	nodes 			map[uint32]*DropNode
}

func (this *RewardManager) Init(){
	for _, v := tbl.TRewardBase.Reward {
		item := &DropItem{}
		item.rewardtype = v.RewardType
		item.rewardid = v.RewardId
		item.rewardvalue = v.RewardValue
		item.prop = v.Prop
		dropid := v.DropId
		node, find := this.nodes[dropid]
		if find {
			node.items = append(node.items, item)
		} else {
			node = &DropNode{}
			node.id = dropid
			node.proptype = v.PropType
			node.totalprop = 0
			node.items = make([]*DropItem, 0)
			node.items = append(node.items, item)
			this.nodes[dropid] = node
		}
		if node.proptype == 2 {
			//权重
			node.totalprop = node.totalprop + item.prop
		}
	}
}

func (this *RewardManager) DropToUser(user *GateUser, id uint32, reason string, notify bool) (gold []string, rets []*DropData) {
	gold = make([]string, 0)
	rewards := make([]*DropData, 0)
	rets = make([]*DropData, 0)
	dropnode, find := this.nodes[id]
	if !find {
		return gold, rets
	}
	rewards = this.GetDropList(dropnode)
	rewards = this.MergeDropData(rewards)
	for _, v := range rewards {
		gold = this.AddToUser(user, v, reason, notify)
		if v.rewardtype != uint32(msg.RewardType_BigGold) {
			rets = append(rets, v)
		}
	}
	return gold, rets
}
// 生成掉落列表
func (this* RewardManager) GetDropList(node *DropNode) []*DropData {
	datas := make([]*DropData, 0)
	if node.proptype == 1 {
		//百分比
		for _, v := range node.items {
			result := util.RandBetween(0, 9999)
			if result <= int32(v.prop) {
				newDatas := this.GenerateDropData(v)
				datas = append(datas, newDatas...)
			}
		}
	} else {
		//权重
		result := util.RandBetween(0, int32(node.totalprop))
		for _, v := range node.items {
			if result < int32(v.prop) {
				newDatas := this.GenerateDropData(v)
				datas = append(datas, newDatas...)
				break
			}
			result = result - int32(v.prop)
		}
	}
	return datas
}

func (this* RewardManager) GenerateDropData(item *DropItem) []*DropData {
	rets := make([]*DropData, 0)
	if item.rewardtype == uint32(msg.RewardType_Drop) {
		node, find := this.nodes[item.rewardid]
		if find {
			rets = this.GetDropList(node)
		}
	} else {
		rets = append(rets, GenerateDropData(item))
	}
	return rets
}
// 合并掉落列表
func (this *RewardManager) MergeDropData(origindatas []*DropData) []*DropData {
	rets := make([]*DropData, 0)
	for _, origin := range origindatas {
		insert := false
		for _, target := range rets {
			if origin.rewardtype == target.rewardtype && origin.rewardid == target.rewardid {
				target.rewardvalue = target.rewardvalue + origin.rewardvalue
				insert = true
				break
			}
		}
		if !insert {
			rets = append(rets, origin)
		}
	}
	return rets
}

func (this *RewardManager) AddToUser(user *GateUser, data *DropData, reason string, notify bool) []string{
	rets := make([]string, 0)
	switch data.rewardtype {
		case uint32(msg.RewardType_BigGold):
			//金币
			goldObj := user.maid.CalculateRewardPerSecond(user)
			goldObj = user.TimesBigGold(goldObj, data.rewardvalue)
			goldObj = user.CarryBigGold(goldObj, user.MaxIndexBigGold(goldObj))
			rets = user.ParseBigGoldToArr(goldObj)
			return rets
		case uint32(msg.RewardType_Power):
			//体力
			user.AddPower(data.rewardvalue, reason, true,notify)
			return rets 
		case uint32(msg.RewardType_Item):
			//道具
			user.AddItem(data.rewardid, data.rewardvalue, reason)
			return rets
		case uint32(msg.RewardType_Favor):
			//好感度 TODO
			return rets
		case uint32(msg.RewardType_MiniGameCoin):
			//小游戏的游戏币
			user.currency.AddMiniGameCoin(data.rewardtype, data.rewardvalue, reason, notify)
			return rets
		case uint32(msg.RewardType_MiniGame):
			return rets
		default:
			return rets
	}
}
