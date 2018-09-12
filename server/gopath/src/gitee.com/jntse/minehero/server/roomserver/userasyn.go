package main
import (
	"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/gotoolkit/log"
)
// --------------------------------------------------------------------------
/// @brief 玩家异步事件
// --------------------------------------------------------------------------


// 获取充值页面
type RechargeCheckEventHandle func() bool
type RechargeCheckEventFeedback func()
type RechargeCheckEvent struct {
	user *RoomUser
	handler RechargeCheckEventHandle
	feedback RechargeCheckEventFeedback
}

func NewRechargeCheckEvent(user *RoomUser, handler RechargeCheckEventHandle, feedback RechargeCheckEventFeedback) * RechargeCheckEvent{
	return &RechargeCheckEvent{user, handler, feedback}
}

func (this *RechargeCheckEvent) Process(ch_fback chan eventque.IEvent) {
	if this.handler() == true {
		ch_fback <- this
	}
}

func (this *RechargeCheckEvent) Feedback() {
	this.feedback()
}


// --------------------------------------------------------------------------
/// @brief 扣除平台金币
///
/// @param 
/// @param 
/// @param string
/// @param int64
///
/// @return 
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
/// @brief 同步平台金币
///
/// @param 
/// @param 
/// @param string
///
/// @return 
// --------------------------------------------------------------------------
type QueryPlatformCoinsEventHandle func() (balance, amt_save int64, errmsg string)
type QueryPlatformCoinsFeedback func(balance, amt_save int64, errmsg string)
type QueryPlatformCoinsEvent struct {
	handler QueryPlatformCoinsEventHandle
	feedback QueryPlatformCoinsFeedback
	balance int64
	amt_save int64
	errmsg string
}

func NewQueryPlatformCoinsEvent(handler QueryPlatformCoinsEventHandle, feedback QueryPlatformCoinsFeedback) *QueryPlatformCoinsEvent {
	return &QueryPlatformCoinsEvent{handler:handler, feedback:feedback}
}

func (this *QueryPlatformCoinsEvent) Process(ch_fback chan eventque.IEvent) {
	tm1 := util.CURTIMEMS()
	this.balance, this.amt_save,  this.errmsg = this.handler()
	ch_fback <- this
	log.Trace("[异步事件] QueryPlatformCoinsEvent 本次消耗 %dms", util.CURTIMEMS() - tm1)
}

func (this *QueryPlatformCoinsEvent) Feedback() {
	if this.feedback != nil { this.feedback(this.balance, this.amt_save, this.errmsg) }
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

