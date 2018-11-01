package main

import (
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/server/tbl/excel"
	pb "github.com/golang/protobuf/proto"
	"gitee.com/jntse/gotoolkit/util"
)

const (
	ShareType_NewMaid					= uint32(1)
	ShareType_NewLevel					= uint32(2)
	ShareType_NewChapter				= uint32(3)
	ShareType_Shop						= uint32(4)
	ShareType_Power						= uint32(5)
	ShareType_MiniGame					= uint32(6)
	ShareType_Event						= uint32(7)
	ShareType_Tryst						= uint32(8)
	ShareType_TurnBrand					= uint32(9)
)

type ShareData struct {
	id 				uint32
	times 			[]uint64
}

func (this *ShareData) LoadBin(bin *msg.ShareData){
	this.id = bin.GetId()
	this.times = make([]uint64, 0)
	for _, v := range bin.GetTimes(){
		this.times = append(this.times, v)
	}
}

func (this *ShareData) PackBin() *msg.ShareData {
	bin := &msg.ShareData{}
	bin.Id = pb.Uint32(this.id)
	bin.Times = make([]uint64, 0)
	for _, v := range this.times {
		bin.Times = append(bin.Times, v)
	}
	return bin
}

// --------------------------------------------------------------------------
/// @brief 分享数据
// --------------------------------------------------------------------------
type UserShare struct {
	shares 			map[uint32]*ShareData
	user 			*GateUser
}

func (this *UserShare) LoadBin(user *GateUser,bin *msg.Serialize){
	this.user = user
	this.shares = make(map[uint32]*ShareData)
	for _, v := range bin.GetShares() {
		share := &ShareData{}
		share.LoadBin(v)
		this.shares[share.id] = share
	}
}

func (this *UserShare) PackBin(bin *msg.Serialize) {
	bin.Shares = make([]*msg.ShareData, 0)
	for _, v := range this.shares {
		bin.Shares = append(bin.Shares, v.PackBin())
	}
}

func (this *UserShare) Syn(){
	send := &msg.GW2C_PushShareData{ Shares: make([]*msg.ShareData, 0)}
	for _, v := range this.shares {
		send.Shares = append(send.Shares, v.PackBin())
	}
	this.user.SendMsg(send)
}

// ========================= 消息接口 =========================
func (this *UserShare) Share(sharetype uint32, id uint32, time uint64) (result uint32, reward bool){
	define := this.GetShareDefine(sharetype, id)
	if define == nil {
		return 1, false
	}
	reward = false
	data, find := this.shares[define.Id]
	if !find {
		reward = true
		data = &ShareData{}
		data.id = define.Id
		data.times = make([]uint64, 0)
		data.times = append(data.times, time)
		this.shares[define.Id] = data
	}
	if !reward {
		if uint32(len(data.times)) < define.Times {
			reward = true
			data.times = append(data.times, time)
		}
	}
	curtime := int64(time)
	if !reward {
		switch (define.FreshType){
			case 0:
				//没有时间限制 
				break
			case 1:
				//每天
				for i, v := range data.times {
					if !util.IsSameDay(int64(v), curtime) {
						reward = true
						data.times[i] = uint64(curtime)
						break
					}
				}
				break
			case 2:
				//和上次不一样
				for i, v := range data.times {
					if v != time {
						reward = true
						data.times[i] = time
						break
					}
				}
				break
			default: 
				break
		}
	}
	for _, v := range data.times {
		if v == time {
			reward = false
			break
		}
	}
	if reward {
		goldbase := make(map[uint32]uint32)
		reward := make([]*DropData, 0)
		//加奖励
		switch (define.ShareType) {
			case ShareType_NewMaid: {
				maidDefine, find := tbl.TMaidLevelBase.TMaidLevelById[define.ShareId]
				if find {
					goldbase, _ = this.user.ParseBigGoldToObj(maidDefine.Reward)
					goldbase = this.user.TimesBigGold(goldbase, define.Reward)
				}
				break
			}
			case ShareType_NewLevel: {
				maidDefine := ConfigMgr().GetLastMaidByLevel(id - 1)
				if maidDefine != nil {
					goldbase, _ = this.user.ParseBigGoldToObj(maidDefine.Reward)
					goldbase = this.user.TimesBigGold(goldbase, define.Reward)
				}
				break
			}
			case ShareType_NewChapter: {
				levels := ConfigMgr().GetLevelsByChapter(id - 1)
				for _, v := range levels {
					curMaidDefine := ConfigMgr().GetLastMaidByLevel(v)
					if curMaidDefine != nil {
						curgold, _ := this.user.ParseBigGoldToObj(curMaidDefine.Reward)
						goldbase = this.user.MergeBigGold(curgold, goldbase)
					}
				}
				goldbase = this.user.TimesBigGold(goldbase, define.Reward)
				break
			}
			case ShareType_Shop: {
				level := this.user.maid.GetMaxLevel()
				maidDefine := ConfigMgr().GetLastMaidByLevel(level)
				if maidDefine != nil {
					goldbase, _ = this.user.ParseBigGoldToObj(maidDefine.Reward)
					goldbase = this.user.TimesBigGold(goldbase, define.Reward)
				}
				break
			}
			case ShareType_Power: {
				this.user.AddPower(define.Reward, "分享奖励", true, true)
				drop := &DropData{}
				drop.rewardtype = uint32(msg.RewardType_Power)
				drop.rewardid = 0
				drop.rewardvalue = define.Reward
				reward = append(reward, drop)
				break
			}
			case ShareType_MiniGame: {
				this.user.currency.AddMiniGameCoin(id, define.Reward, "分享奖励", true)
				drop := &DropData{}
				drop.rewardtype = uint32(msg.RewardType_MiniGameCoin)
				drop.rewardid = id
				drop.rewardvalue = define.Reward
				reward = append(reward, drop)
				break
			}
			case ShareType_Event: {
				level := this.user.maid.GetMaxLevel()
				maidDefine := ConfigMgr().GetLastMaidByLevel(level)
				if maidDefine != nil {
					goldbase, _ = this.user.ParseBigGoldToObj(maidDefine.Reward)
					goldbase = this.user.TimesBigGold(goldbase, define.Reward)
				}
				break
			}
			case ShareType_Tryst: {
				if len(this.user.lastgolds) > 0 {
					goldbase, _ = this.user.ParseBigGoldToObj(this.user.lastgolds)
					goldbase = this.user.TimesBigGold(goldbase, define.Reward)
					this.user.lastgolds = make([]string, 0)
				}
				break
			}
			case ShareType_TurnBrand: {
				if len(this.user.lastgolds) > 0 {
					goldbase, _ = this.user.ParseBigGoldToObj(this.user.lastgolds)
					goldbase = this.user.TimesBigGold(goldbase, define.Reward)
					this.user.lastgolds = make([]string, 0)
				}
				break
			}
			default:
				break
		}
		send := &msg.GW2C_PushShareData{ Shares: make([]*msg.ShareData, 0)}
		send.Shares = append(send.Shares, data.PackBin())
		this.user.SendMsg(send)
		this.user.SendRewardNotify(this.user.ParseBigGoldToArr(goldbase), reward)
	}
	return 0, reward
}

// ========================= 数据处理 ========================= 
func (this *UserShare) GetShareDefine(sharetype uint32, id uint32) *table.ShareDefine {
	for _, v := range tbl.TShareBase.Share {
		if v.ShareType == sharetype && v.ShareId == id {
			return v
		}
	}
	return nil
}
