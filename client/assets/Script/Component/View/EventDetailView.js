let Game = require('../../Game');
const BarrageInterval = 30;
const BarragePosY = [70, 0, -70];
cc.Class({
    extends: cc.GameComponent,
    properties: {
        eventSprite: { default: null, type: cc.Sprite },
        eventNameLabel: { default: null, type: cc.Label },
        eventBarrageItemPrefab: { default: null, type: cc.Prefab },
        barrageNode: { default: null, type: cc.Node },
        headSprite: { default: null, type: cc.Sprite },
        barrageEditBox: { default: null, type: cc.EditBox },
        headListNode: { default: null, type: cc.Node },
        tableView: { default: null, type: cc.tableView },
        bottomNode: { default: null, type: cc.Node },
        shareNode: { default: null, type: cc.Node },

        headInfo: { default: {} },
        barragesInfo: { default: [] },
        eventid: { default: 0 },
        eventConfig: { default: null },
        showBarrage: { default: true },
        enableTime: { default: 0 }
    },
    update: function (dt) {
        if (!this.showBarrage) {
            return;
        }
        let maxX = [0, 0, 0];
        for (let i = 0; i < this.barrageNode.childrenCount; i++) {
            let child = this.barrageNode.children[i];
            let row = Game._.indexOf(BarragePosY, child.y);
            if (row != -1) {
                let barrageItem = child.getComponent('EventBarrageItemNode');
                let x = barrageItem.GetPosXWithRight();
                if (barrageItem.GetPosXWithRight() > maxX[row]) {
                    maxX[row] = x;
                }
            }
        }
        for (let i = 0; i < maxX.length; i++) {
            if (maxX[i] < 500 - BarrageInterval) {
                //构造这一行的弹幕
                let info = this._popBarrageInfo();
                if (info != null) {
                    let node = cc.instantiate(this.eventBarrageItemPrefab);
                    this.barrageNode.addChild(node);
                    let barrageItem = node.getComponent('EventBarrageItemNode');
                    barrageItem.Init(info, BarragePosY[i], this.onBarrageClose.bind(this));
                }
                break;
            }
        }
    },
    onEnable: function () {
        Game.NetWorkController.AddListener('msg.GW2C_AckEventBarrage', this, this.onAckEventBarrage);
        Game.NetWorkController.AddListener('msg.GW2C_AckSendEventBarrage', this, this.onAckSendEventBarrage);
        Game.NetWorkController.AddListener('msg.GW2C_AckShareMessage', this, this._updateShareButton);
        this.showBarrage = Game._.get(this, '_data.showBarrage', true);
        this.bottomNode.active = this.showBarrage;
        this.eventid = Game.TravelModel.openEvent;
        this.enableTime = Game.TimeController.GetCurTime();
        //事件数据
        this.eventConfig = Game.TravelModel.GetEventConfig(this.eventid);
        Game.ResController.GetSpriteFrameByName(this.eventConfig.EventPath, function (err, res) {
            if (!err) {
                this.eventSprite.spriteFrame = res;
            }
        }.bind(this));
        this.eventNameLabel.string = this.eventConfig.EventName;
        //头像
        this.headListNode.active = false;
        this.barrageEditBox.string = '';
        this._changeHeadInfo(Game.TravelModel.headConfigs[0]);
        this.tableView.clear();
        let heads = Game.TravelModel.headConfigs;
        this.tableView.initTableView(heads.length, { array: heads, target: this });
        //弹幕数据
        this.barragesInfo = [];
        Game.NetWorkController.Send('msg.C2GW_ReqEventBarrage', { eventid: this.eventid });
        Game.ResController.DestoryAllChildren(this.barrageNode);
        this._updateShareButton();
    },
    onDisable: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckEventBarrage', this, this.onAckEventBarrage);
        Game.NetWorkController.RemoveListener('msg.GW2C_AckSendEventBarrage', this, this.onAckSendEventBarrage);
        Game.NetWorkController.RemoveListener('msg.GW2C_AckShareMessage', this, this._updateShareButton);
    },

    //按钮回调
    onHeadClick: function () {
        this.headListNode.active = true;
    },
    onSendBarrageClick: function () {
        Game.GuideController.NextGuide();
        if (this.barrageEditBox.string == '') {
            this.showTips("请输入弹幕");
            return;
        }
        let info = this.headInfo.Id + '_' + this.barrageEditBox.string;
        Game.NetWorkController.Send('msg.C2GW_ReqSendEventBarrage', { eventid: this.eventid, barrage: info });
    },
    onHeadItemClick: function (info) {
        this._changeHeadInfo(info);
        this.headListNode.active = false;
    },
    onShareClick: function () {
        Game.Platform.ShareMessage(Game.Define.SHARETYPE.ShareType_Event, this.eventid, this.enableTime);
    },
    onClose: function () {
        Game.GuideController.NextGuide();
        this.closeView(this._url);
    },
    //事件回调
    onAckEventBarrage: function (msgid, data) {
        this.barragesInfo = Game._.concat(this.barragesInfo, data.barrages);
        if (this.barragesInfo.length < this.eventConfig.DefaultBarrage.length) {
            this.barragesInfo = Game._.concat(this.barragesInfo, this.eventConfig.DefaultBarrage);
        }
    },
    onAckSendEventBarrage: function (msgid, data) {
        if (data.result == 0) {
            let info = this.headInfo.Id + '_' + this.barrageEditBox.string;
            this.barragesInfo = Game._.concat([info], this.barragesInfo);
        }
        this.barrageEditBox.string = '';
    },
    onBarrageClose: function (info) {
        this.barragesInfo.push(info);
    },

    _changeHeadInfo: function (info) {
        if (Game._.get(this, 'headInfo.Id', -1) == info.Id) {
            return;
        }
        this.headInfo = info;
        Game.ResController.GetSpriteFrameByName(this.headInfo.HeadPath, function (err, res) {
            if (!err) {
                this.headSprite.spriteFrame = res;
            }
        }.bind(this));
    },
    _popBarrageInfo: function () {
        if (this.barragesInfo.length > 0) {
            return this.barragesInfo.shift();
        }
        return null;
    },
    _updateShareButton: function () {
        this.shareNode.active = Game.ActiveController.GetLastShareRewardTimes(Game.Define.SHARETYPE.ShareType_Event, this.eventid, this.enableTime) > 0;
    }
});
