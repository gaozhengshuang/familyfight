let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let Tools = require('../Util/Tools');
let Define = require('../Util/Define');
let ConfigController = require('../Controller/ConfigController');
let _ = require('lodash');

let TravelModel = function () {
    this.supplyItems = [];
    this.eventid = 0;
    this.eventids = [];

    this.eventConfigs = [];
    this.headConfigs = [];
}

TravelModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckTravelData', this, this.onTravelData);
    NetWorkController.AddListener('msg.GW2C_AckEventData', this, this.onEventData);
    NetWorkController.AddListener('msg.GW2C_AckPrepareTravel', this, this.onPrepareTravel);
    NetWorkController.AddListener('msg.GW2C_AckCheckEvent', this, this.onCheckEvent);

    this.eventConfigs = ConfigController.GetConfig('Event');
    this.headConfigs = ConfigController.GetConfig('Head');
    Tools.InvokeCallback(cb, null);
}

TravelModel.prototype.GetEventConfig = function (id) {
    return _.find(this.eventConfigs, { Id: id });
}
TravelModel.prototype.GetHeadConfig = function (id) {
    return _.find(this.headConfigs, { Id: id });
}
TravelModel.prototype.IsEventOpen = function (id) {
    return _.indexOf(this.eventids, id) != -1;
}
/**
 * 消息处理接口
 */
TravelModel.prototype.onTravelData = function (msgid, data) {
    this.supplyItems = data.data.items;
    this.eventid = data.data.eventid;
    NotificationController.Emit(Define.EVENT_KEY.TRAVELDATA_UPDATE);
}

TravelModel.prototype.onEventData = function (msgid, data) {
    this.eventids = _.union(this.eventids, data.ids);
    NotificationController.Emit(Define.EVENT_KEY.EVENTDATA_UPDATE);
}

TravelModel.prototype.onPrepareTravel = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.SUPPLYPREPARE_ACK, data.result);
}

TravelModel.prototype.onCheckEvent = function (msgid, data) {
}
module.exports = new TravelModel();