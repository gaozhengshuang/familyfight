let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let ConfigController = require('../Controller/ConfigController');
let UserModel = require('./User');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");

var Currency = function () {
    this.powerData = {}
}

Currency.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_SendUserInfo', this, this.onGW2C_UpdatePower);
    NetWorkController.AddListener('msg.GW2C_UpdatePower', this, this.onGW2C_UpdatePower);

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
/**
 * 消息处理接口
 */
Currency.prototype.onGW2C_UpdatePower = function (msgid, data) {
    this.powerData = data.power;
    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEPOWER);
}

module.exports = new Currency();