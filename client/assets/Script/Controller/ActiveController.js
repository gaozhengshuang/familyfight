const Tools = require('../Util/Tools');
const _ = require('lodash');
const moment = require('moment');

const ConfigController = require('./ConfigController');
const NetWorkController = require('./NetWorkController');
const TimeController = require('./TimeController');
const RewardController = require('./RewardController');

let ActiveController = function () {
    this._shareDefines = {};
    this._signinDefine = [];
    this._dailyPowerDefine = {};

    this._shareData = [];
    this._activeData = {};

    this._sharetype = 0;
    this._shareid = 0;
    this._sharetime = 0;
    this._sharing = false;
};
/**
 * 
 * @param {Function} cb 
 */
ActiveController.prototype.Init = function (cb) {
    let shareLists = ConfigController.GetConfig('Share');
    for (let i = 0; i < shareLists.length; i++) {
        let define = shareLists[i];
        this._shareDefines[define.Id] = _.cloneDeep(define);
    }
    this._signinDefine = _.cloneDeep(ConfigController.GetConfig('Signin'));
    this._dailyPowerDefine = _.cloneDeep(ConfigController.GetConfig('DailyPower'));

    NetWorkController.AddListener('msg.GW2C_PushActiveData', this, this.onPushActiveData);
    NetWorkController.AddListener('msg.GW2C_PushShareData', this, this.onPushShareData);
    NetWorkController.AddListener('msg.GW2C_AckShareMessage', this, this.onAckShareMessage);
    Tools.InvokeCallback(cb, null);
};

// ========================= 消息接口 =========================
ActiveController.prototype.onPushActiveData = function (msgid, data) {
    this._activeData = _.cloneDeep(data.active) || {};
}

ActiveController.prototype.onPushShareData = function (msgid, data) {
    this._shareData = _.cloneDeep(data.shares) || [];
}

ActiveController.prototype.onAckShareMessage = function (msgid, data) {
    if (data.result == 0) {
        if (data.reward) {
            RewardController.PlayLastReward();
        }
    }
}

// ========================= 对外接口 =========================
//是否可以签到
ActiveController.prototype.CanSignin = function () {
    let preTime = _.get(this._activeData, 'signintime', 0);
    let curTime = TimeController.GetCurTime();
    return moment.unix(curtime).isAfter(moment.unix(preTime), 'day');
}
//获得这次签到的序号
ActiveController.prototype.GetSigninIndex = function () {
    let index = _.get(this._activeData, 'signinindex', 0);
    if (index >= this._signinDefine.length) {
        index = 0;
    }
    return index;
}
//是否可以领取每日体力
ActiveController.prototype.CanDailyPower = function () {
    let curPassSeconds = curTime - moment.unix(curTime).startOf('day').unix();
    let timeRange = null;
    for (let i = 0; i < this._dailyPowerDefine.Time.length; i++) {
        if (curPassSeconds >= this._dailyPowerDefine.Time[i].MinTime && curPassSeconds <= this._dailyPowerDefine.Time[i].MaxTime) {
            timeRange = this._dailyPowerDefine.Time[i];
            break;
        }
    }
    if (timeRange == null) {
        return false;
    }
    let preTime = _.get(this._activeData, 'dailypowertime', 0);
    if (preTime == 0) {
        return true;
    }
    let curTime = TimeController.GetCurTime();
    if (moment.unix(curTime).isAfter(moment.unix(preTime), 'day')) {
        return true;
    }
    let prePassSeconds = preTime - moment.unix(preTime).startOf('day').unix();
    if (prePassSeconds >= timeRange.MinTime && prePassSeconds <= timeRange.MaxTime) {
        return false;
    }
    return true;
}
//根据类型和id找到分享的配置
ActiveController.prototype.GetShareDefine = function (sharetype, id) {
    return _.find(this._shareDefines, { ShareType: sharetype, ShareId: id });
}
//分享奖励还剩多少次 
ActiveController.prototype.GetLastShareRewardTimes = function (sharetype, id, time) {
    let define = this.GetShareDefine(sharetype, id);
    if (define == null) {
        return 0;
    }
    let data = _.find(this._shareData, { id: define.Id });
    if (data == null) {
        return define.Times;
    }
    let count = 0;
    switch (define.FreshType) {
        case 0:
            //没有时间限制
            return define.Times - (data.times || []).length;
        case 1:
            //每天
            for (let i = 0; i < data.times.length; i++) {
                if (moment.unix(time).isSame(moment.unix(data.times[i]), 'day')) {
                    count++;
                }
            }
            return define.Times - count;
        case 2:
            //和上次不一样就行
            for (let i = 0; i < data.times.length; i++) {
                if (data.times[i] == time) {
                    count++;
                }
            }
            return define.Times - count;
        default:
            return 0;
    }
}
module.exports = new ActiveController();