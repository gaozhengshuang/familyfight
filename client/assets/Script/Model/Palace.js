let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let Tools = require('../Util/Tools');
let Define = require('../Util/Define');
let ConfigController = require('../Controller/ConfigController');
let _ = require('lodash');

var PalaceModel = function () {
    this.curPalaceId = 0;
    this.curPalaceMaidIndex = 0;
    this.palaceDatas = null;
}

PalaceModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckPalaceData', this, this.onGW2C_AckPalaceData);
    NetWorkController.AddListener('msg.GW2C_RetMaidUnlock', this, this.onGW2C_RetMaidUnlock);
    NetWorkController.AddListener('msg.GW2C_RetPalaceTakeBack', this, this.onGW2C_RetPalaceTakeBack);

    Tools.InvokeCallback(cb, null);
}

PalaceModel.prototype.SetCurPalaceId = function (id) {
    this.curPalaceId = id;
}

PalaceModel.prototype.GetCurPalaceId = function () {
    return this.curPalaceId;
}

PalaceModel.prototype.SetPalaceCurMaidIndex = function (index) {
    this.curPalaceMaidIndex = index;
}

PalaceModel.prototype.GetPalaceCurMaidIndex = function () {
    return this.curPalaceMaidIndex;
}

PalaceModel.prototype.GetPalaceDataById = function (id) {
    return _.find(this.palaceDatas, {'id': id});
}

PalaceModel.prototype.GetPalaceMasterLvUpBase = function(MasterId, level) {
    return _.find(ConfigController.GetConfig('PalaceMapMasterLevels'), {'MasterId': MasterId, 'Level': level});
}

/**
 * 消息处理接口
 */
PalaceModel.prototype.onGW2C_AckPalaceData = function (msgid, data) {
    this.palaceDatas = data.datas;

    NotificationController.Emit(Define.EVENT_KEY.PALACEDATA_ACK)
}

PalaceModel.prototype.onGW2C_RetMaidUnlock = function (msgid, data) {
    if (data.result == 0) {
        for (let i = 0; i < this.palaceDatas.length; i ++){
            if (this.palaceDatas[i].id = data.data.id) {
                this.palaceDatas[i] = data.data;
                break;
            }
        }
    
        NotificationController.Emit(Define.EVENT_KEY.PALACEMAID_UNLOCK)
    }
}

PalaceModel.prototype.onGW2C_RetPalaceTakeBack = function (msgid, data) {
    if (data.result == 0) {
        for (let i = 0; i < this.palaceDatas.length; i ++){
            if (this.palaceDatas[i].id = data.data.id) {
                this.palaceDatas[i] = data.data;
                break;
            }
        }
    
        NotificationController.Emit(Define.EVENT_KEY.PALACETASK_ACK, data);
    }
}

module.exports = new PalaceModel();