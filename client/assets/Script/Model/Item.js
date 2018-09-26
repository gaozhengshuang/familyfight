let _ = require('lodash');
let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let ConfigController = require('../Controller/ConfigController');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");

var ItemModel = function () {
    this.items = [];
    this.itemConfigs = [];
}

ItemModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_SendUserInfo', this, this.onGW2C_SendUserInfo);
    NetWorkController.AddListener('msg.GW2C_AddPackageItem', this, this.onGW2C_AddPackageItem);
    NetWorkController.AddListener('msg.GW2C_RemovePackageItem', this, this.onGW2C_RemovePackageItem);
    this.itemConfigs = ConfigController.GetConfig('ItemBaseData');
    Tools.InvokeCallback(cb, null);
}

ItemModel.prototype.GetItems = function () {
    return this.items;
}

ItemModel.prototype.GetItemNumById = function (id) {
    let num = 0;
    let item = _.find(this.items, { 'itemid': id });
    if (item) {
        num = item.num;
    }
    return num;
}
ItemModel.prototype.GetItemsByType = function (type) {
    return _.cloneDeep(_.filter(this.items, function (o) {
        return _.get(o, 'config.Type', -1) == type;
    }));
}

ItemModel.prototype.CreateNewItem = function (id, num) {
    return { id: id, itemid: id, num: num, config: _.find(this.itemConfigs, { Id: id }) }
}

ItemModel.prototype.GetItemConfig = function (id) {
    return _.find(this.itemConfigs, { Id: id })
}
/**
 * 消息处理接口
 */
ItemModel.prototype.onGW2C_SendUserInfo = function (msgid, data) {
    this.items = Tools.GetValueInObj(data, 'item.items') || [];
    console.log(this.items);
    for (let i = 0; i < this.items.length; i++) {
        let item = this.items[i];
        item.config = _.find(this.itemConfigs, { Id: item.id });
        item.itemid = item.id;
    }
}

ItemModel.prototype.onGW2C_AddPackageItem = function (msgid, data) {
    let index = _.findIndex(this.items, { itemid: data.itemid });
    if (index == -1) {
        this.items.push(this.CreateNewItem(data.itemid, data.num));
    } else {
        let item = this.items[index];
        item.num += data.num;
    }

    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEITEMS);
}

ItemModel.prototype.onGW2C_RemovePackageItem = function (msgid, data) {
    let index = _.findIndex(this.items, { itemid: data.itemid });
    if (index == -1) {
        console.log('[严重错误] 玩家物品数据缺失 ' + data.itemid);
    } else {
        let item = this.items[index];
        item.num -= data.num;
        if (item.num <= 0) {
            this.items.splice(index, 1);
        }
    }

    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEITEMS);
}

module.exports = new ItemModel();
