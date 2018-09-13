let async = require('async');
let NetWorkController = require('./NetWorkController');
let NotificationController = require('./NotificationController');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");

var MaidController = function () {
    this._maids = null;
    this.topMaid = 0;
}

MaidController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckMaids', this, this.onGW2C_AckMaids);

    Tools.InvokeCallback(cb, null);
}

MaidController.prototype.getMaids = function() {
    return this._maids;
}

//回调函数
MaidController.prototype.onGW2C_AckMaids = function (msgid, data) {
    if (this._maids == null) {
        this._maids = data.datas;
    } else {
        for (let i = 0; i < data.datas.length; i ++) {
            let _newMaid = data.datas[i];
            for (let b = 0; b < this._maids.length; b ++) {
                let _oldMaid = this._maids[b];
                if (_newMaid.id == _oldMaid.id) {
                    if (_newMaid.count > _oldMaid.count) {
                        NotificationController.Emit(Game.Define.EVENT_KEY.ADD_PLAYER, _newMaid.id);
                    }
                    this._maids[b] = _newMaid;
                    break;
                }
            }
        }
    }
    this.topMaid = data.maxid;
}

module.exports = new MaidController();