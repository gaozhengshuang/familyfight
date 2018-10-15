package main
import (
	"gitee.com/jntse/gotoolkit/log"
	_"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/gotoolkit/util"
	pb "github.com/golang/protobuf/proto"
	"fmt"
	"math"
	"strconv"
	"strings"
)

// money
func (this *GateUser) GetMoney() uint32   { return this.money }
func (this *GateUser) AddMoney(gold uint32, reason string) {
	this.money = this.GetMoney() + gold
	log.Info("玩家[%d] 添加金币[%d] 库存[%d] 原因[%s]", this.Id(), gold, this.GetMoney(), reason)
}

// gold
func (this *GateUser) GetGold() uint64 { return this.gold }
func (this *GateUser) SetGold(gold uint64) {
	this.gold = gold
	log.Info("玩家[%d] 更新gold[%d] 库存[%d] ", this.Id(), gold, this.GetGold())
	send := &msg.GW2C_UpdateTrueGold{Num:pb.Uint64(this.GetGold())}
	this.SendMsg(send)
}
func (this *GateUser) AddGold(gold uint64, reason string) {
	this.gold = this.GetGold() + gold
	log.Info("玩家[%d] 添加gold[%d] 库存[%d] 原因[%s]", this.Id(), gold, this.GetGold(), reason)
	send := &msg.GW2C_UpdateTrueGold{Num:pb.Uint64(this.GetGold())}
	this.SendMsg(send)
}
func (this *GateUser) RemoveGold(gold uint64, reason string ) bool {
	if this.GetGold() < gold {
		return false
	}
	this.gold = this.GetGold() - gold
	log.Info("玩家[%d] 扣除gold[%d] 库存[%d] 原因[%s]", this.Id(), gold, this.GetGold(), reason)
	send := &msg.GW2C_UpdateTrueGold{Num:pb.Uint64(this.GetGold())}
	this.SendMsg(send)
	return true
}

// biggold 不进位
func (this *GateUser) TimesBigGold(golds map[uint32]uint32, times uint32) map[uint32]uint32 {
	ret := make(map[uint32]uint32)
	for i, v := range golds {
		golds[i] = v * times
	}
	return golds
}
func (this *GateUser) MaxIndexBigGold(golds map[uint32]uint32) uint32 {
	ret := uint32(0)
	for i, _ := range golds{
		if i > ret {
			ret = i
		}
	}
	return ret
}
//进位
func (this *GateUser) CarryBigGold(goldObj map[uint32]uint32, maxIndex uint32) map[uint32]uint32 {
	carry := uint32(0)
	for i := uint32(0);i <= maxIndex; i++ {
		gold, find := goldObj[i]
		if find {
			newGold := gold + carry
			if newGold > 10000 {
				carry = uint32(math.Floor(float64(newGold / 10000)))
				newGold = newGold % 10000
			} else {
				carry = 0
			}
			goldObj[i] = newGold
		} else {
			newGold := uint32(math.Floor(float64(carry / 10000)))
			carry = carry % 10000
			goldObj[i] = newGold
		}
	}
	carryIndex := maxIndex + 1
	for {
		if carry == 0 {
			break
		}
		newGold := uint32(math.Floor(float64(carry / 10000)))
		carry = carry % 10000
		goldObj[carryIndex] = newGold
		carryIndex = carryIndex + 1
	}
	return goldObj
}
func (this *GateUser) ParseBigGoldToObj(arr []string)(retObj map[uint32]uint32, maxIndex uint32){
	retObj = make(map[uint32]uint32)
	maxIndex = 0
	for _, v := range arr {
		infos := strings.Split(v, "_")
		if len(infos) > 2 {
			index, _ := strconv.ParseInt(infos[0], 10, 32)
			value, _ := strconv.ParseInt(infos[1], 10, 32)
			if index > maxIndex {
				maxIndex = index
			}
			retObj[index] = value
		}
	}
	return retObj, maxIndex
}
func (this *GateUser) ParseBigGoldToArr(obj map[uint32]uint32) []string{
	retArr := make([]string, 0)
	maxIndex := 0
	for i, _ := range obj{
		if i > maxIndex {
			maxIndex = i
		}
	}
	for i := maxIndex; i >= 0; i-- {
		v, find := obj[i]
		if find {
			retArr = append(retArr, fmt.Sprintf("%d_%d", i, v))
		} else {
			retArr = append(retArr, fmt.Sprintf("%d_0", i))
		}
	} 
	return retArr
}
func (this *GateUser) GetBigGold() []string { return this.biggold }
func (this *GateUser) SetBigGold(biggold []string) {
	this.biggold = biggold[:]
	log.Info("玩家[%d] 设置biggold 原因[%s]", this.Id(), reason)
	send := &msg.GW2C_UpdateBigGold{Golds: this.GetBigGold()[:]}
	this.SendMsg(send)
}
func (this *GateUser) AddBigGold(additionObj map[uint32]uint32, reason string) {
	goldObj, maxIndex := this.ParseBigGoldToObj(this.GetBigGold())
	for i, v := range additionObj {
		gold, find := goldObj[i]
		if find {
			goldObj[i] = gold + v
		} else {
			if i > maxIndex{
				maxIndex = i
			}
			goldObj[i] = v
		}
	}
	//加好了 进位
	this.biggold = this.ParseBigGoldToArr(this.CarryBigGold(goldObj))
	log.Info("玩家[%d] 添加biggold 原因[%s]", this.Id(), reason)
	send := &msg.GW2C_UpdateBigGold{Golds: this.GetBigGold()[:]}
	this.SendMsg(send)
}

// 添加元宝
func (this *GateUser) GetYuanbao() uint32 { return this.yuanbao }
func (this *GateUser) AddYuanbao(yuanbao uint32, reason string) {
	this.yuanbao = this.GetYuanbao() + yuanbao
	send := &msg.GW2C_UpdateYuanbao{Num:pb.Uint32(this.GetYuanbao())}
	this.SendMsg(send)
	RCounter().IncrByDate("item_add", int32(msg.ItemId_YuanBao), int32(yuanbao))
	log.Info("玩家[%d] 添加元宝[%d] 库存[%d] 原因[%s]", this.Id(), yuanbao, this.GetYuanbao(), reason)
	this.PlatformPushLootMoney(float32(yuanbao))
}
func (this *GateUser) RemoveYuanbao(yuanbao uint32, reason string) bool {
	if this.GetYuanbao() >= yuanbao {
		this.yuanbao = this.GetYuanbao() - yuanbao
		send := &msg.GW2C_UpdateYuanbao{Num:pb.Uint32(this.GetYuanbao())}
		this.SendMsg(send)
		log.Info("玩家[%d] 扣除元宝[%d] 库存[%d] 原因[%s]", this.Id(), yuanbao, this.GetYuanbao(), reason)
		RCounter().IncrByDate("item_remove", int32(msg.ItemId_YuanBao), int32(yuanbao))
		this.PlatformPushConsumeMoney(float32(yuanbao))
		return true
	}
	log.Info("玩家[%d] 扣除元宝[%d]失败 库存[%d] 原因[%s]", this.Id(), yuanbao, this.GetYuanbao(), reason)
	return false
}


// 添加金卷
func (this *GateUser) GetCoupon() uint32  { return this.coupon }
func (this *GateUser) AddCoupon(num uint32, reason string) {
	this.coupon = this.GetCoupon() + num
	send := &msg.GW2C_UpdateCoupon{Num:pb.Uint32(this.GetCoupon())}
	this.SendMsg(send)
	log.Info("玩家[%d] 添加金卷[%d] 库存[%d] 原因[%s]", this.Id(), num, this.GetCoupon(), reason)
}
func (this *GateUser) RemoveCoupon(num uint32, reason string) bool {
	if this.GetCoupon() >= num {
		this.coupon = this.GetCoupon() - num
		send := &msg.GW2C_UpdateCoupon{Num:pb.Uint32(this.GetCoupon())}
		this.SendMsg(send)
		log.Info("玩家[%d] 添加金卷[%d] 库存[%d] 原因[%s]", this.Id(), num, this.GetCoupon(), reason)
		//CountMgr().AddRemove(uint32(msg.ItemId_Coupon), num)
		RCounter().IncrByDate("item_remove", int32(msg.ItemId_Coupon), int32(num))
		return true
	}
	log.Info("玩家[%d] 添加金卷[%d]失败 库存[%d] 原因[%s]", this.Id(), num, this.GetCoupon(), reason)
	return false
}

// 体力
func (this *GateUser) NotifyPower(){
	if this.online {
		send := &msg.GW2C_UpdatePower{ Power: this.PackPower()}
		this.SendMsg(send)
	}
}
func (this *GateUser) UpdatePower(curtimes uint64) {
	newPower := this.GetPower()
	for {
		if newPower >= this.maxpower {
			break
		}
		if this.nextpowertime > curtimes {
			break
		}
		log.Info("玩家[%d] 下次增加体力时间[%d] 当前时间[%d]",this.Id(),this.nextpowertime,curtimes)
		this.nextpowertime = this.nextpowertime + uint64(tbl.Common.PowerAddInterval)
		newPower = newPower + uint32(tbl.Common.PowerAddition)
	}
	addition := newPower - this.GetPower()
	if addition > 0 {
		this.AddPower(addition,"定时加体力", false,true)
	}
}
func (this *GateUser) PackPower() *msg.PowerData {
	data := &msg.PowerData{}
	data.Power = pb.Uint32(this.power)
	data.Nexttime = pb.Uint64(this.nextpowertime)
	data.Maxpower = pb.Uint32(this.maxpower)
	return data
}
func (this *GateUser) GetPower() uint32 { return this.power }
func (this *GateUser) AddPower(num uint32, reason string, ignorelimit bool, notify bool) {
	newpower := this.GetPower() + num
	if !ignorelimit {
		if this.GetPower() < this.maxpower {
			newpower = uint32(math.Min(float64(newpower), float64(this.maxpower)))
		} else {
			newpower = this.GetPower()
		}
	}
	if newpower != this.GetPower() {
		this.power = newpower
		if notify {
			this.NotifyPower();
		}
		log.Info("玩家[%d] 添加体力[%d] 库存[%d] 原因[%s]", this.Id(), num, this.GetPower(), reason)
	}
}
func (this *GateUser) RemovePower(num uint32, reason string) bool {
	if this.GetPower() >= num {
		this.power = this.GetPower() - num
		if this.power < this.maxpower && this.power + num >= this.maxpower {
			this.nextpowertime = uint64(util.CURTIME()) + uint64(tbl.Common.PowerAddInterval)
		}
		this.NotifyPower();
		log.Info("玩家[%d] 扣除体力[%d] 库存[%d] 原因[%s]", this.Id(), num, this.GetPower(), reason)
		return true
	}
	log.Info("玩家[%d] 扣除体力[%d]失败 库存[%d] 原因[%s]", this.Id(), num, this.GetPower(), reason)
	return false
}
