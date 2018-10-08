const _ = require('lodash');
const Tools = require('../Util/Tools');
const ConfigController = require('../Controller/ConfigController');
const NotificationController = require('../Controller/NotificationController');
let Define = require('../Util/Define');

var GuideController = function () {
    this._guide = 1;
}

GuideController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
}

GuideController.prototype.SetGuide = function (guide) {
    this._guide = guide;
    NotificationController.Emit(Define.EVENT_KEY.GUIDE_ACK);
}

GuideController.prototype.GetGuide = function() {
    return this._guide;
}

GuideController.prototype.IsGuide = function() {
    return ConfigController.GetConfigById("Guide", this._guide).NextGuide != 0;
}

module.exports = new GuideController();