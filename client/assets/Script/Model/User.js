let Define = require('../Util/Define');
let Platform = require('../Platform/CommonGame');
let Tools = require('../Util/Tools');
let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let GuideController = require('../Controller/GuideController');

var UserModel = function () {
    this.loginInfo = null;
    this.userInfo = {};
    this.offLineReward = null;
}

UserModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_SendUserInfo', this, this.onGW2C_SendUserInfo);
    NetWorkController.AddListener('msg.GW2C_RetLogin', this, this.onGW2C_RetLogin);
    NetWorkController.AddListener('msg.GW2C_UpdateGold', this, this.onGW2C_UpdateGold);
    NetWorkController.AddListener('msg.GW2C_OfflineReward', this, this.onGW2C_OfflineReward);
    NetWorkController.AddListener('msg.GW2C_AckGuideData', this, this.onGW2C_AckGuideData);

    NotificationController.On(Define.EVENT_KEY.USERINFO_ADDGOLD, this, this.AddGold);
    NotificationController.On(Define.EVENT_KEY.USERINFO_SUBTRACTGOLD, this, this.SubtractGold);

    Tools.InvokeCallback(cb);
}

/**
 * 对外接口
 */
UserModel.prototype.GetUserId = function () {
    return Tools.GetValueInObj(this.userInfo, 'entity.id');
}

UserModel.prototype.GetFaceUrl = function () {
    return Tools.GetValueInObj(this.loginInfo, 'face') || '';
}

UserModel.prototype.GetAccount = function () {
    if (cc.sys.platform == cc.sys.WECHAT_GAME) {
        return Tools.GetValueInObj(this.loginInfo, 'openid');
    } else {
        return Tools.GetValueInObj(this.loginInfo, 'account');
    }
}

UserModel.prototype.GetUserName = function () {
    return Tools.GetValueInObj(this.loginInfo, 'nickname');
}

UserModel.prototype.GetUser = function (cb) {
    if (Platform.PLATFORM == 'Normal') {
        Tools.InvokeCallback(cb, null);
    } else {
        if (!Tools.InvokeCallback(window.GetCurrentUser, function (usr) {
            Tools.InvokeCallback(cb, usr);
        })) {
            Tools.InvokeCallback(cb, null);
        }
    }
}

UserModel.prototype.AddGold = function (gold) {
    let value = this.GetGold() + gold;
    this.SetGold(value);
}

UserModel.prototype.SubtractGold = function (gold) {
    let value = this.GetGold() - gold;
    this.SetGold(value);
}

UserModel.prototype.SetGold = function (gold) {
    if (isNaN(gold)) {
        return;
    }
    Tools.SetValueInObj(this.userInfo, 'base.gold', gold)
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEGOLD, gold);
}

UserModel.prototype.GetGold = function () {
    return Tools.GetValueInObj(this.userInfo, 'base.gold') || 0;
}

UserModel.prototype.GetOffLineReward = function () {
    return this.offLineReward;
}

/**
 * 消息处理接口
 */
UserModel.prototype.onGW2C_RetLogin = function (msgid, data) {
    if (data.errcode != null) {
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, data.errcode);
    }
}

UserModel.prototype.onGW2C_SendUserInfo = function (msgid, data) {
    this.userInfo = data;
    NotificationController.Emit(Define.EVENT_KEY.CONNECT_TO_GATESERVER);
    
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEGOLD, Tools.GetValueInObj(this.userInfo, 'base.gold') || 0);
    let Game = require('../Game');
    Game.Platform.SendUserInfo();
}

UserModel.prototype.onGW2C_UpdateGold = function (msgid, data) {
    let value = data.num || 0;
    this.SetGold(value)
}

UserModel.prototype.onGW2C_OfflineReward = function (msgid, data) {
    this.offLineReward = data;
    NotificationController.Emit(Define.EVENT_KEY.OFFLINE_ACK);
}

UserModel.prototype.onGW2C_AckGuideData = function (msgid, data) {
    GuideController.SetGuide(data.guide);
}

module.exports = new UserModel();