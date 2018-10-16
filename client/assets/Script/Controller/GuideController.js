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

// GuideController.prototype.IsShopOpen = function () {
//     return this.IsGuidePass(Define.GUIDE_DEFINE.BUTTON_OPENSHOP);
// }

// GuideController.prototype.IsTurnBrandOpen = function () {
//     return this.IsGuidePass(Define.GUIDE_DEFINE.BUTTON_OPENTURNBRAND);
// }

// GuideController.prototype.IsPalaceOpen = function () {
//     return this.IsGuidePass(Define.GUIDE_DEFINE.BUTTON_OPENPALACE);
// }

// GuideController.prototype.IsGuidePass = function (id) {
//     if (this.IsGuide()) {
//         return this._guide >= id;
//     }
//     return true;
// }
module.exports = new GuideController();