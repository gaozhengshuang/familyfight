package main
import (
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/golang/protobuf/proto"
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

type TrystReward struct {
	palaceid 		uint32
	rewardbyevent 	map[uint32]uint32	
}

type RewardManager struct {
	nodes 			map[uint32]*DropNode
	trystrewards 	map[uint32]*TrystReward
}

func (this *RewardManager) Init(){
	this.nodes = make(map[uint32]*DropNode)
	for _, v := range tbl.TRewardBase.Reward {
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

	this.trystrewards = make(map[uint32]*TrystReward)
	for _, v := range tbl.TDateRewardBase.DateReward {
		trystreward, find := this.trystrewards[v.Level]
		key := v.Time << 20 | v.Place << 10 | v.Event
		if find {
			trystreward.rewardbyevent[key] = v.Reward
		} else {
			trystreward := &TrystReward{}
			trystreward.palaceid = v.Level
			trystreward.rewardbyevent = make(map[uint32]uint32)
			trystreward.rewardbyevent[key] = v.Reward
			this.trystrewards[v.Level] = trystreward
		}
	}
}

func (this *RewardManager) GetTrystReward(level uint32, key uint32) uint32{
	trystreward, find := this.trystrewards[level]
	if find {
		result, _ := trystreward.rewardbyevent[key]
		return result
	} else {
		return 0
	}
}

func (this *RewardManager) DropToUser(user *GateUser, id uint32, reason string, notify bool, param uint32) (gold []string, rets []*DropData) {
	gold = make([]string, 0)
	rewards := make([]*DropData, 0)
	rets = make([]*DropData, 0)
	dropnode, find := this.nodes[id]
	if !find {
		return gold, rets
	}
	rewards = this.GetDropList(dropnode)
	rewards = this.MergeDropData(rewards)
	gold, rets = this.CalculateReward(user, rewards)
	if len(gold) > 0 {
		user.lastgolds = gold
	}
	for _, v := range rets {
		this.AddToUser(user, v, reason, notify, param)
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

func (this *RewardManager) CalculateReward(user *GateUser, rewards []*DropData)(gold []string, other []*DropData){
	gold = make([]string, 0)
	other = make([]*DropData, 0)
	for _, v := range rewards {
		if v.rewardtype != uint32(msg.RewardType_BigGold) {
			other = append(rets, v)
		} else {
			goldObj := user.maid.CalculateRewardPerSecond(user)
			goldObj = user.TimesBigGold(goldObj, v.rewardvalue)
			goldObj = user.CarryBigGold(goldObj, user.MaxIndexBigGold(goldObj))
			gold = user.ParseBigGoldToArr(goldObj)
		}
	}
	return gold, other
}

func (this *RewardManager) AddToUser(user *GateUser, data *DropData, reason string, notify bool, param uint32){
	switch data.rewardtype {
		case uint32(msg.RewardType_BigGold):
			//金币
			break
		case uint32(msg.RewardType_Power):
			//体力
			log.Info("玩家[%d] 掉落体力 数量[%d] 原因[%s]", user.Id(),data.rewardvalue, reason)
			user.AddPower(data.rewardvalue, reason, true,notify)
			break
		case uint32(msg.RewardType_Item):
			//道具
			log.Info("玩家[%d] 掉落道具 id[%d] 数量[%d] 原因[%s]", user.Id(),data.rewardid, data.rewardvalue, reason)
			user.AddItem(data.rewardid, data.rewardvalue, reason)
			break
		case uint32(msg.RewardType_Favor):
			//好感度 TODO
			user.palace.AddLuckily(user, param, data.rewardvalue)
			break
		case uint32(msg.RewardType_MiniGameCoin):
			//小游戏的游戏币
			log.Info("玩家[%d] 掉落小游戏币 id[%d] 数量[%d] 原因[%s]", user.Id(),data.rewardid, data.rewardvalue, reason)
			user.currency.AddMiniGameCoin(data.rewardid, data.rewardvalue, reason, notify)
			break
		case uint32(msg.RewardType_MiniGame):
			log.Info("玩家[%d] 掉落小游戏 id[%d] 原因[%s]", user.Id(),data.rewardid,reason)
			break
		default:
			break
	}
}

func (this* RewardManager) PackMsg(golds []string ,rewards []*DropData) *msg.RewardsData{
	ret := &msg.RewardsData{}
	ret.Golds = golds
	ret.Rewards = make([]*msg.RewardData, 0)
	for _, v := range rewards {
		rewarddata := &msg.RewardData{}
		rewarddata.Rewardtype = pb.Uint32(v.rewardtype)
		rewarddata.Rewardid = pb.Uint32(v.rewardid)
		rewarddata.Rewardvalue = pb.Uint32(v.rewardvalue)
		ret.Rewards = append(ret.Rewards, rewarddata)
	}
	return ret
}