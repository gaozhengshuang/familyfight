const _ = require('lodash');
const Tools = require('../Util/Tools');

var GuideController = function () {
    this._guide = 1;
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

module.exports = new GuideController();