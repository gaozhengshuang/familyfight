let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let Tools = require('../Util/Tools');
let Define = require('../Util/Define');
let UIName = require('../Util/UIName');
let ViewController = require('../Controller/ViewController');
let ConfigController = require('../Controller/ConfigController');
let _ = require('lodash');

var MiniGameModel = function () {
    this.guessKingData = null;
}

MiniGameModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckGuessKingData', this, this.onGW2C_AckGuessKingData);
    NetWorkController.AddListener('msg.GW2C_AckGuessKing', this, this.onGW2C_AckGuessKing);
    
    Tools.InvokeCallback(cb, null);
}

MiniGameModel.prototype.GetGuessKingData = function () {
    return this.guessKingData;
}
/**
 * 消息处理接口
 */
MiniGameModel.prototype.onGW2C_AckGuessKingData = function (msgid, data) {
    this.guessKingData = data.data;
    ViewController.openView(UIName.UI_ACTIVEGAMEGUESSKING);
}

MiniGameModel.prototype.onGW2C_AckGuessKing = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.GUESSKING_ACK, data);
}

module.exports = new MiniGameModel();