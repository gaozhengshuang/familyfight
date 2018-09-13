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

//回调函数
MaidController.prototype.onGW2C_AckMaids = function (msgid, data) {
    this._maids = data.datas;
    this.topMaid = data.maxid;
}

module.exports = new MaidController();