package main
import (
	"gitee.com/jntse/gotoolkit/log"
	_"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/golang/protobuf/proto"
)

// money
func (this *GateUser) GetMoney() uint32   { return this.money }
func (this *GateUser) AddMoney(gold uint32, reason string) {
	this.money = this.GetMoney() + gold
	log.Info("玩家[%d] 添加金币[%d] 库存[%d] 原因[%s]", this.Id(), gold, this.GetMoney(), reason)
}

// gold
func (this *GateUser) GetGold() uint64 { return this.gold }
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
	RCounter().IncrByDate("item_add", uint32(msg.ItemId_YuanBao), yuanbao)
	log.Info("玩家[%d] 添加元宝[%d] 库存[%d] 原因[%s]", this.Id(), yuanbao, this.GetYuanbao(), reason)
	this.PlatformPushLootMoney(float32(yuanbao))
}
func (this *GateUser) RemoveYuanbao(yuanbao uint32, reason string) bool {
	if this.GetYuanbao() >= yuanbao {
		this.yuanbao = this.GetYuanbao() - yuanbao
		send := &msg.GW2C_UpdateYuanbao{Num:pb.Uint32(this.GetYuanbao())}
		this.SendMsg(send)
		log.Info("玩家[%d] 扣除元宝[%d] 库存[%d] 原因[%s]", this.Id(), yuanbao, this.GetYuanbao(), reason)
		RCounter().IncrByDate("item_remove", uint32(msg.ItemId_YuanBao), yuanbao)
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
		RCounter().IncrByDate("item_remove", uint32(msg.ItemId_Coupon), num)
		return true
	}
	log.Info("玩家[%d] 添加金卷[%d]失败 库存[%d] 原因[%s]", this.Id(), num, this.GetCoupon(), reason)
	return false
}
