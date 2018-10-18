const _ = require('lodash');
const NetWorkController = require('../Controller/NetWorkController');
const NotificationController = require('../Controller/NotificationController');
const ConfigController = require('../Controller/ConfigController');
const UserModel = require('./User');
const Tools = require("../Util/Tools");
const Define = require("../Util/Define");

const DefaultMiniGameCoin = function () {
    let ret = [];
    for (let i = Define.MINIGAMETYPE.START; i < Define.MINIGAMETYPE.END; i++) {
        ret.push(0);
    }
    return ret;
}

var Currency = function () {
    this.powerData = {}
    this.bigGolds = ['0_0'];
    this.offLineReward = null;
    this.miniGameCoin = DefaultMiniGameCoin();
}

Currency.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_SendUserInfo', this, this.onGW2C_SendUserInfo);
    NetWorkController.AddListener('msg.GW2C_UpdatePower', this, this.onGW2C_UpdatePower);
    NetWorkController.AddListener('msg.GW2C_UpdateBigGold', this, this.onGW2C_UpdateBigGold);
    NetWorkController.AddListener('msg.GW2C_OfflineReward', this, this.onGW2C_OfflineReward);

    NotificationController.On(Define.EVENT_KEY.USERINFO_ADDGOLD, this, this.AddGold);
    NotificationController.On(Define.EVENT_KEY.USERINFO_SUBTRACTGOLD, this, this.SubtractGold);

    Tools.InvokeCallback(cb, null);
}


Currency.prototype.GetPower = function () {
    return Tools.GetValueInObj(this.powerData, 'power') || 0
}

Currency.prototype.GetNextPowerTime = function () {
    return Tools.GetValueInObj(this.powerData, 'nexttime') || 0
}

Currency.prototype.GetMaxPower = function () {
    return Tools.GetValueInObj(this.powerData, 'maxpower') || 0
}

Currency.prototype.GetPowerAddition = function () {
    return ConfigController.GetConfig('PowerAddition') || 0
}

Currency.prototype.AddGold = function (gold) {
    let value = Tools.toBigIntMoney(this.GetGold()).add(Tools.toBigIntMoney(gold));
    this.SetGold(Tools.toLocalMoney(value));
}

Currency.prototype.SubtractGold = function (gold) {
    let value = Tools.toBigIntMoney(this.GetGold()).subtract(Tools.toBigIntMoney(gold));
    this.SetGold(Tools.toLocalMoney(value));
}

Currency.prototype.SetGold = function (gold) {
    if (!_.isArray(gold)) {
        return;
    }
    this.bigGolds = gold;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEGOLD, gold);
}

Currency.prototype.GetGold = function () {
    return this.bigGolds;
}

Currency.prototype.CompareGold = function (gold) {
    return Tools.toBigIntMoney(this.GetGold()).compare(Tools.toBigIntMoney(gold));
}
Currency.prototype.GetMiniGameCoin = function (gametype) {
    return this.miniGameCoin[gametype] || 0;
}
/**
 * 消息处理接口
 */
Currency.prototype.onGW2C_SendUserInfo = function (msgid, data) {
    this.powerData = Tools.GetValueInObj(data, 'base.power');
    this.SetGold(Tools.GetValueInObj(data, 'base.biggold') || ['0_0']);
    this.miniGameCoin = _.get(data, 'base.gamecoin', DefaultMiniGameCoin());
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEPOWER);
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN);
}
Currency.prototype.onGW2C_UpdatePower = function (msgid, data) {
    this.powerData = data.power;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEPOWER);
}

Currency.prototype.onGW2C_UpdateBigGold = function (msgid, data) {
    let value = data.golds || ["0_0"];
    this.SetGold(value)
}
Currency.prototype.onGW2C_UpdateMiniGameCoin = function (msgid, data) {
    this.miniGameCoin = data.gamecoin || DefaultMiniGameCoin();
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN);
}
Currency.prototype.onGW2C_OfflineReward = function (msgid, data) {
    this.offLineReward = data;
    NotificationController.Emit(Define.EVENT_KEY.OFFLINE_ACK);
}

module.exports = new Currency();