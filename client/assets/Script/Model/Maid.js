let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let ConfigController = require('../Controller/ConfigController');
let UserModel = require('./User');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");

var Maid = function () {
    this._maids = null;
    this.topMaid = 1;
    this._shopMaids = [];
    this.curPass = 1;
}

Maid.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckMaids', this, this.onGW2C_AckMaids);
    NetWorkController.AddListener('msg.GW2C_AckMergeMaid', this, this.onGW2C_AckMergeMaid);
    NetWorkController.AddListener('msg.GW2C_AckMaidShop', this, this.onGW2C_AckMaidShop);
    NetWorkController.AddListener('msg.GW2C_AckBuyMaid', this, this.onGW2C_AckBuyMaid);

    Tools.InvokeCallback(cb, null);
}

Maid.prototype.GetMaids = function() {
    return this._maids;
}

Maid.prototype.GetTopMaid = function() {
    return this.topMaid;
}

Maid.prototype.GetShopMaids = function() {
    return this._shopMaids;
}

Maid.prototype.SetCurPass = function (pass) {
    this.curPass = pass;
}

Maid.prototype.GetCurPass = function () {
    return this.curPass;
}

Maid.prototype.GetTopPass = function () {
    let pass = 1;
    let maidBase = ConfigController.GetConfigById("TMaidLevel", this.GetTopMaid());
    if (maidBase) {
        pass = maidBase.Passlevels;
    } 
    return pass;
}

/**
 * 消息处理接口
 */
Maid.prototype.onGW2C_AckMaids = function (msgid, data) {
    if (this._maids == null) {
        this._maids = data.datas;
    } else {
        for (let i = 0; i < data.datas.length; i ++) {
            let _newMaid = data.datas[i];
            for (let b = 0; b < this._maids.length; b ++) {
                let _oldMaid = this._maids[b];
                if (_newMaid.id == _oldMaid.id) {
                    if (_newMaid.count > _oldMaid.count) {
                        NotificationController.Emit(Define.EVENT_KEY.ADD_PLAYER, _newMaid.id);
                    }
                    this._maids[b] = _newMaid;
                    break;
                }
            }
        }
    }

    if (this.topMaid != data.maxid) {
        NotificationController.Emit(Define.EVENT_KEY.FINDNEW_PLAYER, data.maxid);
    }
    this.topMaid = data.maxid;
}

Maid.prototype.onGW2C_AckMergeMaid = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.MERGEPLAYER_ACK, data.result);
}

Maid.prototype.onGW2C_AckMaidShop = function (msgid, data) {
    this._shopMaids = data.shop;
    NotificationController.Emit(Define.EVENT_KEY.MAID_UPDATESHOP);
}

Maid.prototype.onGW2C_AckBuyMaid = function (msgid, data) {
    if (data.result == 0) {
        UserModel.SubtractGold(data.price);
    }
}

module.exports = new Maid();