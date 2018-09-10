let Define = require('../Util/Define');
let PlatformDefine = require('../Util/PlatformDefine');
let Tools = require('../Util/Tools');
let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let HttpUtil = require('../Util/HttpUtil');

var UserModel = function () {
    this.loginInfo = null;
    this.userInfo = {};
    this.platformCoins = 0;
}

UserModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_SendUserInfo', this, this.onGW2C_SendUserInfo);
    NetWorkController.AddListener('msg.GW2C_RetLogin', this, this.onGW2C_RetLogin);
    NetWorkController.AddListener('msg.GW2C_SendUserPlatformMoney', this, this.onGW2C_SendUserPlatformMoney);
    NetWorkController.AddListener('msg.GW2C_RetDeliveryDiamond', this, this.onGW2C_RetDeliveryDiamond);
    NetWorkController.AddListener('msg.GW2C_UpdateGold', this, this.onGW2C_UpdateGold);
    NetWorkController.AddListener('msg.GW2C_UpdateYuanbao', this, this.onGW2C_UpdateYuanbao);

    Tools.InvokeCallback(cb);
}

/**
 * 对外接口
 */
UserModel.prototype.GetUserId = function () {
    return Tools.GetValueInObj(this.userInfo, 'entity.id');
    // return 1010008;
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

UserModel.prototype.GetTvToken = function (cb) {
    if (PlatformDefine.PLATFORM == 'Normal') {
        Tools.InvokeCallback(cb, '');
    } else {
        if (!Tools.InvokeCallback(window.GetCurrentUser, function (usr) {
            Tools.InvokeCallback(cb, usr.token);
        })) {
            Tools.InvokeCallback(cb, '');
        }
    }
}
UserModel.prototype.GetUser = function (cb) {
    if (PlatformDefine.PLATFORM == 'Normal') {
        Tools.InvokeCallback(cb, null);
    } else {
        if (!Tools.InvokeCallback(window.GetCurrentUser, function (usr) {
            Tools.InvokeCallback(cb, usr);
        })) {
            Tools.InvokeCallback(cb, null);
        }
    }
}

UserModel.prototype.GetPlayerGoods = function (cb) {
    HttpUtil.HTTPGet(PlatformDefine.GOODSPATH, { uid: this.GetUserId(), state: 0 }, function (retJson) {
        if (retJson.code == 0 || retJson.msg == "操作成功") {
            Tools.InvokeCallback(cb, retJson.data);
        } else {
            Tools.InvokeCallback(cb, []);
        }
    });
}
UserModel.prototype.GetCostCurrency = function () {
    // if (PlatformDefine.PLATFORM == 'Normal') {
    return Tools.GetValueInObj(this.userInfo, 'base.yuanbao') || 0;
    // } else {
    //     return this.platformCoins || 0;
    // }
    // return 1000000;
}
UserModel.prototype.GetMoney = function () {
    return Tools.GetValueInObj(this.userInfo, 'base.money') || 0;
}
/**
 * 消息处理接口
 */
UserModel.prototype.onGW2C_RetLogin = function (msgid, data) {
    if (data.errcode != null) {
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, { text: '<color=#ffffff>' + data.errcode + '</color>' });
    }
}

UserModel.prototype.onGW2C_SendUserInfo = function (msgid, data) {
    this.userInfo = data;
    NotificationController.Emit(Define.EVENT_KEY.CONNECT_TO_GATESERVER);
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEMONEY, Tools.GetValueInObj(this.userInfo, 'base.money') || 0);
    let Game = require('../Game');
    Game.Platform.SendUserInfo();
}

UserModel.prototype.onGW2C_SendUserPlatformMoney = function (msgid, data) {
    this.platformCoins = data.coins || 0;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATECOINS, this.platformCoins);
}
UserModel.prototype.onGW2C_UpdateYuanbao = function (msgid, data) {
    this.userInfo.base.yuanbao = data.num;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEYUANBAO);
}
UserModel.prototype.onGW2C_RetDeliveryDiamond = function (msgid, data) {
    let content = '提取钻石:' + data.diamond + '个，提取钻石券:' + data.diamondparts + '个，折算钻石' + (data.total - data.diamond) +
        '个，本次共提取钻石' + data.total + '个';
    NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, { text: content, alive: 5 });
}

UserModel.prototype.onGW2C_UpdateGold = function (msgid, data) {
    let value = data.num || 0;
    Tools.SetValueInObj(this.userInfo, 'base.money', value)
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEMONEY, value);
}

module.exports = new UserModel();