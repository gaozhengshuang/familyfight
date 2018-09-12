package main
import (
	"gitee.com/jntse/minehero/pbmsg"
	"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/gotoolkit/log"
)
// --------------------------------------------------------------------------
/// @brief 玩家异步事件
// --------------------------------------------------------------------------


// --------------------------------------------------------------------------
/// @brief 获取充值页面
// --------------------------------------------------------------------------
type RechargeEventHandle func(tvmid string, token string, user *GateUser, amount uint32)
type UserRechargeEvent struct {
	user *GateUser
	tvmid string
	token string
	amount uint32
	handler RechargeEventHandle
}

func NewUserRechargeEvent(user *GateUser, tvmid, token string, amount uint32, handler RechargeEventHandle) *UserRechargeEvent {
	return &UserRechargeEvent{tvmid:tvmid,token:token,user:user,amount:amount,handler:handler}
}

func (this *UserRechargeEvent) Process(ch_fback chan eventque.IEvent) {
	this.handler(this.tvmid, this.token, this.user, this.amount)
}

func (this *UserRechargeEvent) Feedback() {
}


// --------------------------------------------------------------------------
/// @brief  玩家存盘
// --------------------------------------------------------------------------
type UserSaveEventHandle func()
type UserSaveEvent struct {
	handler UserSaveEventHandle
}

func NewUserSaveEvent(handler UserSaveEventHandle) *UserSaveEvent {
	return &UserSaveEvent{handler:handler}
}

func (this *UserSaveEvent) Process(ch_fback chan eventque.IEvent) {
	this.handler()
}

func (this *UserSaveEvent) Feedback() {
}


// --------------------------------------------------------------------------
/// @brief 玩家发货
// --------------------------------------------------------------------------
type DeliveryGoodsHandle func(list []*msg.DeliveryGoods, token string)
type DeliveryGoodsEvent struct {
	list []*msg.DeliveryGoods
	token string
	handler DeliveryGoodsHandle
}

func NewDeliveryGoodsEvent(list []*msg.DeliveryGoods, token string, handler DeliveryGoodsHandle) *DeliveryGoodsEvent {
	return &DeliveryGoodsEvent{list:list, token:token, handler:handler}
}

func (this *DeliveryGoodsEvent) Process(ch_fback chan eventque.IEvent) {
	tm1 := util.CURTIMEMS()
	this.handler(this.list, this.token)
	log.Trace("[异步事件] DeliveryGoodsEvent 本次消耗 %dms", util.CURTIMEMS() - tm1)
}

func (this *DeliveryGoodsEvent) Feedback() {
}


// --------------------------------------------------------------------------
/// @brief 整点给玩家免费步数
// --------------------------------------------------------------------------
type GiveFreeStepHandle func(now int64, reason string)
type GiveFreeStepEvent struct {
	now int64
	reason string
	handler GiveFreeStepHandle
}

func NewGiveFreeStepEvent(now int64, reason string, handler GiveFreeStepHandle) *GiveFreeStepEvent { 
	return &GiveFreeStepEvent{now:now,reason:reason,handler:handler}
}

func (this *GiveFreeStepEvent) Process(ch_fback chan eventque.IEvent) {
	this.handler(this.now, this.reason)
}

func (this *GiveFreeStepEvent) Feedback() {
}

// --------------------------------------------------------------------------
/// @brief 同步平台金币
// --------------------------------------------------------------------------
type QueryPlatformCoinsEventHandle func() (balance, save_amt int64, errmsg string)
type QueryPlatformCoinsFeedback func(balance, save_amt int64, errmsg string)
type QueryPlatformCoinsEvent struct {
	handler QueryPlatformCoinsEventHandle
	feedback QueryPlatformCoinsFeedback
	balance int64
	save_amt int64
	errmsg string
}

func NewQueryPlatformCoinsEvent(handler QueryPlatformCoinsEventHandle, feedback QueryPlatformCoinsFeedback) *QueryPlatformCoinsEvent {
	return &QueryPlatformCoinsEvent{handler:handler, feedback:feedback}
}

func (this *QueryPlatformCoinsEvent) Process(ch_fback chan eventque.IEvent) {
	tm1 := util.CURTIMEMS()
	this.balance, this.save_amt, this.errmsg = this.handler()
	ch_fback <- this
	log.Trace("[异步事件] QueryPlatformCoinsEvent 本次消耗 %dms", util.CURTIMEMS() - tm1)
}

func (this *QueryPlatformCoinsEvent) Feedback() {
	if this.feedback != nil { this.feedback(this.balance, this.save_amt, this.errmsg) }
}

// --------------------------------------------------------------------------
/// @brief 扣除平台金币
// --------------------------------------------------------------------------
type RemovePlatformCoinsEventHandle func(amount int64) (balance int64, errmsg string)
type RemovePlatformCoinsFeedback func(balance int64, errmsg string, amount int64)
type RemovePlatformCoinsEvent struct {
	handler RemovePlatformCoinsEventHandle
	amount int64

	feedback RemovePlatformCoinsFeedback
	balance int64
	errmsg string
}

func NewRemovePlatformCoinsEvent(amount int64, h RemovePlatformCoinsEventHandle, fb RemovePlatformCoinsFeedback) *RemovePlatformCoinsEvent {
	return &RemovePlatformCoinsEvent{h, amount, fb, 0, ""}
}

func (this *RemovePlatformCoinsEvent) Process(ch_fback chan eventque.IEvent) {
	tm1 := util.CURTIMEMS()
	this.balance, this.errmsg = this.handler(this.amount)
	ch_fback <- this
	log.Trace("[异步事件] QueryPlatformCoinsEvent 本次消耗 %dms", util.CURTIMEMS() - tm1)
}

func (this *RemovePlatformCoinsEvent) Feedback() {
	if this.feedback != nil { this.feedback(this.balance, this.errmsg, this.amount) }
}

// --------------------------------------------------------------------------
/// @brief 添加平台金币
// --------------------------------------------------------------------------
type AddPlatformCoinsEventHandle func(amount int64) (balance int64, errmsg string)
type AddPlatformCoinsFeedback func(balance int64, errmsg string, amount int64)
type AddPlatformCoinsEvent struct {
	handler AddPlatformCoinsEventHandle
	amount int64

	feedback AddPlatformCoinsFeedback
	balance int64
	errmsg string
}

func NewAddPlatformCoinsEvent(amount int64, h AddPlatformCoinsEventHandle, fb AddPlatformCoinsFeedback) *AddPlatformCoinsEvent {
	return &AddPlatformCoinsEvent{h, amount, fb, 0, ""}
}

func (this *AddPlatformCoinsEvent) Process(ch_fback chan eventque.IEvent) {
	tm1 := util.CURTIMEMS()
	this.balance, this.errmsg = this.handler(this.amount)
	ch_fback <- this
	log.Trace("[异步事件] QueryPlatformCoinsEvent 本次消耗 %dms", util.CURTIMEMS() - tm1)
}

func (this *AddPlatformCoinsEvent) Feedback() {
	if this.feedback != nil { this.feedback(this.balance, this.errmsg, this.amount) }
}


