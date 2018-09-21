let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let ConfigController = require('../Controller/ConfigController');
let UserModel = require('./User');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");
let _ = require('lodash');

var PalaceModel = function () {
    this.curPalaceId = 0;
    this.palaceDatas = null;
}

PalaceModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckPalaceData', this, this.onGW2C_AckPalaceData);

    Tools.InvokeCallback(cb, null);
}

PalaceModel.prototype.SetPalaceId = function(id) {
    this.curPalaceId = id;
}

PalaceModel.prototype.GetPalaceId = function() {
    return this.curPalaceId;
}

PalaceModel.prototype.GetPalaceDataById = function(id) {
    return _.find(this.palaceDatas, {'id': id});
}

/**
 * 消息处理接口
 */
PalaceModel.prototype.onGW2C_AckPalaceData = function (msgid, data) {
    this.palaceDatas = data.datas;

    NotificationController.Emit(Define.EVENT_KEY.PALACEDATA_ACK)
}

module.exports = new PalaceModel();