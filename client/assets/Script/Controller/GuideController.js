const _ = require('lodash');
const Tools = require('../Util/Tools');

var GuideController = function () {

}

GuideController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
}

module.exports = new GuideController();