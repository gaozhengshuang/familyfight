const _ = require('lodash');
const Tools = require('../Util/Tools');
const ConfigController = require('../Controller/ConfigController');
const NotificationController = require('../Controller/NotificationController');
const Define = require('../Util/Define');
const NetWorkController = require('../Controller/NetWorkController');

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

GuideController.prototype.GetGuide = function () {
    return this._guide;
}

GuideController.prototype.GetGuideConfig = function (id) {
    return ConfigController.GetConfigById("Guide", id);
}

GuideController.prototype.IsGuide = function () {
    return ConfigController.GetConfigById("Guide", this._guide).NextGuide != 0;
}

GuideController.prototype.SendGuide = function (guide) {
    if (this.IsGuide()) {
        let config = this.GetGuideConfig(guide);
        if (config.Upload) {
            NetWorkController.Send('msg.C2GW_UpdateGuideData', { guide: guide });
        } else {
            this.SetGuide(guide);
        }

    }
}

GuideController.prototype.NextGuide = function () {
    this.SendGuide(ConfigController.GetConfigById("Guide", this._guide).NextGuide);
}

module.exports = new GuideController();