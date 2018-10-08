const _ = require('lodash');
const Tools = require('../Util/Tools');
const ConfigController = require('../Controller/ConfigController');

var GuideController = function () {
    this._guide = 4;
}

GuideController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
}

GuideController.prototype.SetGuide = function (guide) {
    this._guide = guide;
}

GuideController.prototype.GetGuide = function() {
    return this._guide;
}

GuideController.prototype.IsGuide = function() {
    return ConfigController.GetConfigById("Guide", this._guide).NextGuide != 0;
}

module.exports = new GuideController();