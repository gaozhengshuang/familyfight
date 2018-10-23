const _ = require('lodash');

const Tools = require('../Util/Tools');

const NetWorkController = require('./NetWorkController');
const NotificationController = require('./NotificationController');

let RewardController = function () {
};
/**
 * 
 * @param {Function} cb 
 */
RewardController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
};

module.exports = new RewardController();