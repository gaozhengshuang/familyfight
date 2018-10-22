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
	"strings"
	"strconv"
)

// 获得奖励
func (this *GateUser) AddReward(rtype uint32, rid uint32 ,rvalue uint32,rparam uint32,reason string,notify bool) (result uint32, value []string) { 
	value = make([]string, 0)
	switch rtype {
		case 1:
			//金币
			goldrewardratio, find := tbl.TGoldRewardRatioBase.GoldRewardRatioById[rvalue]
			if !find {
				this.SendNotify("没有奖励金币的模板哟")
				return 10, value
			}
			ratio := float64(0.0)
			maxlevel := this.maid.GetMaxLevel()
			for _, v := range goldrewardratio.RatioByLevel {
				infos := strings.Split(v, "_")
				if len(infos) >= 2 {
					id, _ := strconv.ParseInt(infos[0],10,32)
					if maxlevel == uint32(id) {
						//找到了
						ratio, _ = strconv.ParseFloat(infos[1], 64)
						break
					}
				}
			}
			goldObj := this.maid.CalculateRewardPerSecond(this)
			goldObj = this.TimesBigGold(goldObj, uint32(ratio))
			goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
			value = this.ParseBigGoldToArr(goldObj)
			return 0, value
		case 2:
			//体力
			this.AddPower(rvalue, reason, true,notify)
			return 0, value 
		case 3:
			//侍女
			maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[rid] 
			if !find {
				this.SendNotify("没有对应的侍女配置")
				return 1, value
			}
			if reason != "开箱子" {
				count := this.GetCountByLevel(uint32(maidconfg.Passlevels))
				if count >= 20 {
					this.SendNotify("该关卡侍女数量已达上限")
					return 2, value
				}
			}
			//可以获得了
			maid := this.maid.AddMaid(this,rid,rvalue)
			maidSend := &msg.GW2C_AckMaids{ Datas: make([]*msg.MaidData, 0) }
			maidSend.Datas = append(maidSend.Datas, maid.PackBin())
			maidSend.Maxid = pb.Uint32(this.maid.GetMaxId())
			this.SendMsg(maidSend)
			return 0, value
		case 4:
			//道具
			this.AddItem(rid, rvalue, reason)
			return 0, value
		case 5:
			//小游戏
			return 0, value
		case 6:
			//小游戏的游戏币
			//随机一个类型
			gametype := uint32(util.RandBetween(int32(MiniGameCoinType_Start),int32(MiniGameCoinType_End) - 1))
			this.currency.AddMiniGameCoin(gametype, rvalue, reason, notify)
			return 0, value
		default:
			return 0, value
	}
}

//翻牌子
func (this *GateUser) TurnBrand(ids []uint32,level uint32) (result uint32, id uint32, gold []string) {
	gold = make([]string, 0)
	// 体力够不够 
	if this.GetPower() < 1 {
		this.SendNotify("体力不足")
		return 1, 0, gold
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
		return 2, 0, gold
	}
	//扣体力
	this.RemovePower(1,"翻牌子消耗")
	result, gold = this.AddReward(findbrand.Type, findbrand.RewardId, findbrand.Value,level, "翻牌子奖励", false)
	return result, findbrand.Id, gold
}

//连连看
func (this *GateUser) Linkup(score uint32) (gold []string){
	gold = make([]string, 0)
	goldrewardratio, find := tbl.TGoldRewardRatioBase.GoldRewardRatioById[uint32(tbl.Common.LinkupGoldRewardRatio)]
	if !find {
		this.SendNotify("没有奖励金币的模板哟")
		return gold
	}
	maxlevel := this.maid.GetMaxLevel()
	ratio := float64(0.0)
	for _, v := range goldrewardratio.RatioByLevel {
		infos := strings.Split(v, "_")
		if len(infos) >= 2 {
			id, _ := strconv.ParseInt(infos[0],10,32)
			if maxlevel == uint32(id) {
				//找到了
				ratio, _ = strconv.ParseFloat(infos[1], 64)
				break
			}
		}
	}
	goldObj := this.maid.CalculateRewardPerSecond(this)
	goldObj = this.TimesBigGold(goldObj, uint32(ratio))
	goldObj = this.TimesBigGold(goldObj, uint32(score))
	goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
	return this.ParseBigGoldToArr(goldObj)
}

//箱子数据
func (this *GateUser) LoadBox(bin *msg.Serialize){
	this.boxs = make(map[uint32]*BoxData)
	boxs := bin.GetBoxs()
	for _, v := range boxs {
		boxData := &BoxData{}
		boxData.id = v.GetId()
		boxData.num = v.GetNum()
		boxData.level = v.GetLevel()
		boxData.generatetime = v.GetGeneratetime()
		this.boxs[boxData.id] = boxData
	}
}

func (this *GateUser) PackBox(bin *msg.Serialize) {
	bin.Boxs =  make([]*msg.BoxData,0) 
	for _, box := range this.boxs {
		bin.Boxs = append(bin.Boxs, box.PackBin())
	}
}

func (this *GateUser) SynBox(){
	send := &msg.GW2C_AckBoxData{ Box: make([]*msg.BoxData,0) }
	for _, box := range this.boxs {
		send.Box = append(send.Box, box.PackBin())
	}
	this.SendMsg(send)
}

func (this *GateUser) GenerateBox(id uint32, num uint32, level uint32) *BoxData{
	count := this.GetCountByLevel(level)
	if count + num > 20 {
		return nil
	}
	//看看这关的侍女是不是到最大值了
	boxData, _ := this.boxs[id]
	if boxData == nil {
		boxData := &BoxData{}
		boxData.id = id
		boxData.num = num
		boxData.level = level
		boxData.generatetime = uint64(util.CURTIME())
		this.boxs[id] = boxData
	} else {
		boxData.num = boxData.num + num
		boxData.generatetime = uint64(util.CURTIME())
	}
	return boxData
}

func (this *GateUser) OpenBox(id uint32, num uint32) uint32 {
	boxtmpl, find := tbl.TBoxBase.DropBoxById[id]
	if !find {
		this.SendNotify("未找到箱子配置")
		return 1
	}
	boxData, find := this.boxs[id]
	if !find {
		this.SendNotify("您没有这个宝箱")
		return 2
	}
	if boxData.num < num {
		this.SendNotify("箱子数量不足")
		return 3
	}
	//开吧
	result, _ := this.AddReward(boxtmpl.Type, boxtmpl.RewardId, boxtmpl.Value * num,0, "开箱子", true)
	if result != 0 {
		return result
	} else {
		//扣除吧
		boxData.num = boxData.num - num
		this.SynBox()
		return 0
	}
}

func (this *GateUser) TickBox(now uint64) {
	if !this.guide.IsGuidePass(119) {
		return
	}
	generated := false
	for _, v := range tbl.TBoxBase.DropBox {
		if v.Interval != 0 {
			//是根据时间差来生成的
			boxData, find := this.boxs[v.Id]
			if !find {
				//没找到， 那给你生成一个
				boxData = this.GenerateBox(v.Id, 1, v.Level)
				if boxData != nil {
					generated = true
				}
			} else {
				//找到了 看看时间差
				//看看能不能掉
				if now > boxData.generatetime + uint64(v.Interval) {
					boxData = this.GenerateBox(v.Id, 1, v.Level)
					if boxData != nil {
						generated = true
					}
				}
			}
		}
	}
	if generated {
		this.SynBox()
	}
}
//十秒小游戏
func (this *GateUser) TenSecond(hit bool) (result uint32, gold []string, items []*msg.PairNumItem) {
	gold = make([]string, 0)
	items = make([]*msg.PairNumItem, 0)
	// 体力够不够 
	if this.currency.GetMiniGameCoin(MiniGameCoinType_TenSecond) < 1 {
		this.SendNotify("游戏币不足")
		return 1, gold, items
	}
	//可以了
	if hit {
		//成功物品
		for _, v := range tbl.Common.TenSecondWinReward.Item {
			if len(v) >= 2 {
				this.AddReward(4, uint32(v[0]), uint32(v[1]), 0, "十秒游戏奖励", true)
				items = append(items, &msg.PairNumItem{ Itemid: pb.Uint32( uint32(v[0])), Num: pb.Uint64(uint64(v[1])) })
			}
		}
		goldObj := this.maid.CalculateRewardPerSecond(this)
		goldObj = this.TimesBigGold(goldObj, uint32(tbl.Common.TenSecondWinReward.Gold))
		goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
		gold = this.ParseBigGoldToArr(goldObj)
	} else {
		//奖励金币
		goldObj := this.maid.CalculateRewardPerSecond(this)
		goldObj = this.TimesBigGold(goldObj, uint32(tbl.Common.TenSeceondLoseRatio.Gold))
		goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
		gold = this.ParseBigGoldToArr(goldObj)
	}
	//扣体力
	this.currency.RemoveMiniGameCoin(MiniGameCoinType_TenSecond, 1,"十秒游戏消耗", true)
	return 0, gold, items
}
//踢屁股
func (this *GateUser) KickAss (hit bool) (result uint32, gold []string) {
	gold = make([]string, 0)
	// 体力够不够 
	if this.currency.GetMiniGameCoin(MiniGameCoinType_KickAss) < 1 {
		this.SendNotify("游戏币不足")
		return 1, gold
	}
	//可以了
	if hit {
		//成功物品
		goldObj := this.maid.CalculateRewardPerSecond(this)
		goldObj = this.TimesBigGold(goldObj, uint32(tbl.Common.KickAssWinReward.Gold))
		goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
		gold = this.ParseBigGoldToArr(goldObj)
	} else {
		//奖励金币
		goldObj := this.maid.CalculateRewardPerSecond(this)
		goldObj = this.TimesBigGold(goldObj, uint32(tbl.Common.KickAssLoseReward.Gold))
		goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
		gold = this.ParseBigGoldToArr(goldObj)
	}
	//扣体力
	this.currency.RemoveMiniGameCoin(MiniGameCoinType_KickAss, 1,"踢屁股消耗", true)
	return 0, gold
}

//攻击后宫
func (this *GateUser) ReqAttackData() *msg.GW2C_AckAttackPalaceData {
	robots := RobotMgr().RandomRobot(1)
	send := &msg.GW2C_AckAttackPalaceData{}
	if len(robots) > 0 {
		robot := robots[0]
		send.Data = &msg.RobotPalaceData{}
		send.Data.Id = pb.Uint64(robot.id)
		send.Data.Name = pb.String(robot.name)
		send.Data.Face = pb.String(robot.face)
		//随机一个宫殿
		palace := robot.RandomPalace()
		if palace != nil {
			send.Data.Palace = palace.PackBin()
		}
	}
	return send
}

func (this *GateUser) AttackPalace(id uint64) []string {
	gold := make([]string, 0)
	//成功物品
	goldObj := this.maid.CalculateRewardPerSecond(this)
	goldObj = this.TimesBigGold(goldObj, uint32(tbl.Common.AttackPalaceReward.Gold))
	goldObj = this.CarryBigGold(goldObj, this.MaxIndexBigGold(goldObj))
	gold = this.ParseBigGoldToArr(goldObj)
	if this.Id() != id && id != 0 {
		//生成记录
		key := fmt.Sprintf("activerecord_%d", id)
		record := fmt.Sprintf("%s攻击了您的后宫", this.Name())
		err := Redis().LPush(key, record).Err()
		if err != nil {
			log.Error("创建攻击后宫记录失败 id: %d ，err: %s", id, err)
		}
		lenth := Redis().LLen(key).Val()
		if int32(lenth) >= int32(tbl.Common.ActiveRecordCount) {
			//超长了
			err = Redis().BRPop(0, key).Err()
			if err != nil {
				log.Error("删除多余互动操作记录失败 id: %d err: %s", id, err)
			}
		}
		user := UserMgr().FindById(id)
		if user != nil {
			send := &msg.GW2C_PushActiveRecord{ Records: make([]string, 0) }
			send.Records = append(send.Records, record)
			user.SendMsg(send)
		}
	}
	return gold
}

func (this *GateUser) SynAttackPalaceRecords() {
	str := make([]string, 0)
	key := fmt.Sprintf("activerecord_%d", this.Id())
	rlist, err := Redis().LRange(key, 0, -1).Result()
	send := &msg.GW2C_PushActiveRecord{ Records: make([]string, 0) }
	if err != nil {
		log.Error("加载互动记录失败 id %d ，err: %s", this.Id(), err)
	}else{
		send.Records = rlist
	}
	this.SendMsg(send)
}