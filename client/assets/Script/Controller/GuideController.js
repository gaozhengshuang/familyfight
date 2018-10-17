const _ = require('lodash');
const Tools = require('../Util/Tools');
const ConfigController = require('../Controller/ConfigController');
const NotificationController = require('../Controller/NotificationController');
const Define = require('../Util/Define');
const NetWorkController = require('../Controller/NetWorkController');

let GuideConf = function () {
    this.id = 0;
    this.startid = 0;
    this.index = 0;
}

var GuideController = function () {
    this._guide = 1;
    this._guideData = [];
}

GuideController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_PushGuideData', this, this.onPushGuideData);
    Tools.InvokeCallback(cb, null);
}

GuideController.prototype.SetGuide = function (guide) {
    this._guide = guide;

    NotificationController.Emit(Define.EVENT_KEY.GUIDE_ACK);

    if (guide != 0) {
        NotificationController.Emit(Define.EVENT_KEY.GUIDE_OPEN);
    } else {
        NotificationController.Emit(Define.EVENT_KEY.GUIDE_OVER);
    }
}

GuideController.prototype.GetGuide = function () {
    return this._guide;
}

GuideController.prototype.GetGuideConfig = function (id) {
    return ConfigController.GetConfigById("Guide", id);
}

GuideController.prototype.IsGuide = function () {
    return this._guide != 0;
}

GuideController.prototype.SendGuide = function (guide) {
    if (this.IsGuide()) {
        NetWorkController.Send('msg.C2GW_UpdateGuideData', { guide: guide });
    }
}

GuideController.prototype.NextGuide = function () {
    this.SendGuide(this._guide);
}

GuideController.prototype.IsGuideComplete = function (guide) {
    if (this._guide == guide) {
        return true;
    }
    return _.indexOf(this._guideData, guide) != -1;
}

GuideController.prototype.onPushGuideData = function (msgid, data) {
    this._guideData = _.cloneDeep(data.guides) || [];
}

module.exports = new GuideController();