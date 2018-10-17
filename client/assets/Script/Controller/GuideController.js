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
    this._guideMap = [];
    this._guideConf = {};
    this._guideData = [];
}

GuideController.prototype.Init = function (cb) {
    let guides = ConfigController.GetConfig('Guide');
    for (let i = 0; i < guides.length; i++) {
        let guide = guides[i];
        let conf = new GuideConf();
        let guideGroup = [];
        conf.id = guide.Id;
        if (guide.ConditionType == 2) {
            let preGuide = this._guideConf[guide.ConditionValue];
            if (preGuide) {
                conf.index = preGuide.index;
                conf.startid = preGuide.startid;
            }
            guideGroup = this._guideMap[conf.index];
            guideGroup.push(conf);
        } else {
            conf.index = this._guideMap.length;
            conf.startid = conf.id;
            guideGroup.push(conf);
            this._guideMap.push(guideGroup);
        }
        this._guideConf[conf.id] = conf;
    }
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
    let conf = this._guideConf[guide]
    if (conf == null) {
        return false;
    }
    for (let i = 0; i < this._guideData.length; i++) {
        let _guide = this._guideData[i];
        let _conf = this._guideConf[_guide];
        if (_conf == null) {
            continue;
        }
        if (_conf.startid == conf.startid) {
            //就是这一组
            return _guide >= guide;
        }
    }
    return false;
}

GuideController.prototype.onPushGuideData = function (msgid, data) {
    this._guideData = _.cloneDeep(data.guides) || [];
}

module.exports = new GuideController();