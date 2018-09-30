let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let ConfigController = require('../Controller/ConfigController');
let Tools = require("../Util/Tools");
let Define = require("../Util/Define");

var MaidModel = function () {
    this._maids = null;
    this.topMaid = 1;
    this._shopMaids = [];
    this.curPass = 1;
    this.curChapter = 1;
}

MaidModel.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_AckMaids', this, this.onGW2C_AckMaids);
    NetWorkController.AddListener('msg.GW2C_AckMergeMaid', this, this.onGW2C_AckMergeMaid);
    NetWorkController.AddListener('msg.GW2C_AckMaidShop', this, this.onGW2C_AckMaidShop);
    NetWorkController.AddListener('msg.GW2C_AckBuyMaid', this, this.onGW2C_AckBuyMaid);
    NetWorkController.AddListener('msg.GW2C_RetOpenBox', this, this.onGW2C_RetOpenBox);

    Tools.InvokeCallback(cb, null);
}

MaidModel.prototype.GetMaids = function() {
    return this._maids;
}

MaidModel.prototype.GetTopMaid = function() {
    return this.topMaid;
}

MaidModel.prototype.GetShopMaids = function() {
    return this._shopMaids;
}

MaidModel.prototype.SetCurPass = function (pass) {
    this.curPass = pass;
}

MaidModel.prototype.GetCurPass = function () {
    return this.curPass;
}

MaidModel.prototype.GetTopPass = function () {
    let pass = 1;
    let maidBase = ConfigController.GetConfigById("TMaidLevel", this.GetTopMaid());
    if (maidBase) {
        pass = maidBase.Passlevels;
    } 
    return pass;
}

MaidModel.prototype.SetCurChapter = function (chapter) {
    this.curChapter = chapter;
}

MaidModel.prototype.GetCurChapter = function () {
    return this.curChapter;
}

MaidModel.prototype.GetTopChapter = function() {
    let chapter = 1;
    let passLvBase = ConfigController.GetConfigById("PassLevels", this.GetTopPass());
    if (passLvBase) {
        chapter = passLvBase.ChapterID;
    }
    return chapter;
}

MaidModel.prototype.IsAddMaid = function (_maidId) {
    let maidBase = ConfigController.GetConfigById("TMaidLevel", _maidId);
    if (maidBase && maidBase.Passlevels == this.GetCurPass()) {
        NotificationController.Emit(Define.EVENT_KEY.ADD_PLAYER, _maidId);
    }
}

MaidModel.prototype.GetMaidNameById = function (_maidId) {
    let name = '';
    let maidBase = ConfigController.GetConfigById("TMaidLevel", _maidId);
    if (maidBase) {
        name = maidBase.Name;
    } 
    return name;
}

/**
 * 消息处理接口
 */
MaidModel.prototype.onGW2C_AckMaids = function (msgid, data) {
    if (this._maids == null) {
        this._maids = data.datas;
    } else {
        for (let i = 0; i < data.datas.length; i ++) {
            let isNewPlayer = true;
            let _newMaid = data.datas[i];
            for (let b = 0; b < this._maids.length; b ++) {
                let _oldMaid = this._maids[b];
                if (_newMaid.id == _oldMaid.id) {
                    if (_newMaid.count > _oldMaid.count) {
                        for (let t = 0; t < _newMaid.count - _oldMaid.count; t ++) {
                            this.IsAddMaid(_newMaid.id);
                        }
                    }
                    this._maids[b] = _newMaid;
                    isNewPlayer = false;
                    break;
                }
            }
            
            if (isNewPlayer) {
                this._maids.push(_newMaid);
                this.IsAddMaid(_newMaid.id);
            }
        }
    }

    if (this.topMaid != data.maxid) {
        this.topMaid = data.maxid;
        NotificationController.Emit(Define.EVENT_KEY.FINDNEW_PLAYER);
    }
}

MaidModel.prototype.onGW2C_AckMergeMaid = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.MERGEPLAYER_ACK, data.result);
}

MaidModel.prototype.onGW2C_AckMaidShop = function (msgid, data) {
    this._shopMaids = data.shop;
    NotificationController.Emit(Define.EVENT_KEY.MAID_UPDATESHOP);
}

MaidModel.prototype.onGW2C_AckBuyMaid = function (msgid, data) {
    if (data.result == 0) {
        NotificationController.Emit(Define.EVENT_KEY.USERINFO_SUBTRACTGOLD, data.price);
    }
}

MaidModel.prototype.onGW2C_RetOpenBox = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.OPENBOX_ACK, data.result);
}

module.exports = new MaidModel();