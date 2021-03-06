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
