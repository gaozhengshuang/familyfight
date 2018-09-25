let _ = require('lodash');
let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");

var ItemModel = function () {
    this.items = {};
}

ItemModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_SendUserInfo', this, this.onGW2C_SendUserInfo);
    NetWorkController.AddListener('msg.GW2C_AddPackageItem', this, this.onGW2C_AddPackageItem);
    NetWorkController.AddListener('msg.GW2C_RemovePackageItem', this, this.onGW2C_RemovePackageItem);

    Tools.InvokeCallback(cb, null);
}

ItemModel.prototype.GetItems = function() {
    return this.items;
}

ItemModel.prototype.GetItemNumById = function(id) {
    let num = 0;
    let item = _.find(this.items, { 'itemid': id });
    if (item) {
        num = item.num;
    }
    return num;
}

/**
 * 消息处理接口
 */
ItemModel.prototype.onGW2C_SendUserInfo = function (msgid, data) {
    this.items = Tools.GetValueInObj(data, 'item.items') || [];
}

ItemModel.prototype.onGW2C_AddPackageItem = function (msgid, data) {
    let index = _.findIndex(this.items, { itemid: data.itemid });
    if (index == -1) {
        this.items.push({ itemid: data.itemid, num: data.num });
    } else {
        let item = this.items[index];
        item.num += data.num;
    }

    NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEITEMS);
}

ItemModel.prototype.onGW2C_RemovePackageItem = function (msgid, data) {
    let index = _.findIndex(this.items, { id: data.itemid });
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
