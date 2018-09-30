let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let Tools = require('../Util/Tools');
let Define = require('../Util/Define');
let ConfigController = require('../Controller/ConfigController');
let _ = require('lodash');

let BoxModel = function () {
    //{level:[boxdata]}
    this.boxDatas = [];
}

BoxModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckBoxData', this, this.onAckBoxData);
    Tools.InvokeCallback(cb, null);
}

BoxModel.prototype.GetBoxsByLevel = function (level) {
    return _.filter(this.boxDatas, { level: level });
}

/**
 * 消息处理接口
 */
//箱子数据
BoxModel.prototype.onAckBoxData = function (msgid, data) {
    let changeList = [];
    data.box = data.box || [];
    for (let i = 0; i < data.box.length; i++) {
        let newBox = data.box[i];
        let oldBox = _.find(this.boxDatas, { id: newBox.id });
        if (oldBox == null) {
            changeList.push[_.cloneDeep(newBox)];
        } else {
            if (newBox.num != oldBox.num) {
                changeList.push({ id: newBox.id, num: newBox.num - oldBox.num, level: newBox.level, generatetime: newBox.generatetime });
            }
        }
    }
    this.boxDatas = _.cloneDeep(data.box);
    NotificationController.Emit(Define.EVENT_KEY.BOXDATA_UPDATE, changeList);
}

/**
 * 
 */
module.exports = new BoxModel();