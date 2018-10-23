const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_head: { default: null, type: cc.Sprite },
        image_event0: { default: null, type: cc.Sprite },
        image_event1: { default: null, type: cc.Sprite },
        image_event2: { default: null, type: cc.Sprite },
        label_event0: { default: null, type: cc.Label },
        label_event1: { default: null, type: cc.Label },
        label_event2: { default: null, type: cc.Label },
        label_select: { default: null, type: cc.Label },
        label_name: { default: null, type: cc.Label },
        label_content: { default: null, type: cc.RichText },
        node_back: { default: null, type: cc.Node },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.resetData();
        this.updateView();
        this.updateDialog();
    },

    onDisable() {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckTryst', this, this.onGW2C_AckTryst);
    },

    initData() {
        this._aniTime = 1.0;
        this._delayTime = 1.0;
    },

    resetData() {
        this._selIds = [];
        this._selContent = [];
        this._curStep = 1;
        this._maxStep = 3;
        this._eventNum = 3;

        this._data = Game.PalaceModel.palaceDatas[Math.floor(Math.random() * Game.PalaceModel.palaceDatas.length)]; //随机出一个宫殿

        this.node_back.active = false;
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.GW2C_AckTryst', this, this.onGW2C_AckTryst);
    },

    updateView() {
        if (this._data) {
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
            if (palaceMapBase) {
                let maidBase = Game.ConfigController.GetConfigById("PalacePersonnel", palaceMapBase.Master);
                if (maidBase) {
                    this.label_name.string = maidBase.Name;
                    Game.ResController.SetSprite(this.image_head, maidBase.Path);
                }
            }

            this.eventList = [];
            let dateEventList = Game.ConfigController.GetConfig("DateEvent");
            for (let i = 0; i < dateEventList.length; i ++) {
                if (dateEventList[i].Datetype == this._curStep) {
                    this.eventList.push(dateEventList[i]);
                }
            }
            this.eventList = Game._.sampleSize(this.eventList, this._eventNum);
            for(let n = 0; n < this.eventList.length; n ++) {
                let eventBase = this.eventList[n];
                Game.ResController.SetSprite(this["image_event"+n], eventBase.Datepath);
                this["label_event"+n].string = eventBase.DateName;
            }   
        }
    },

    updateDialog() {
        let contentLength = this._selContent.length;
        if (contentLength == 0) {
            this.label_content.string = "<color=#58210A>嫔妾给皇上请安，现在是...</c><color=#FF8C8C>";
            this.label_select.string = "请选择时间...";
        } else if (contentLength == 1) {
            this.label_content.string = "<color=#58210A>嫔妾给皇上请安，现在是</c><color=#FF8C8C>" + this._selContent[0] + "</c><color=#58210A>的...</c>";
            this.label_select.string = "请选择地点...";
        } else if (contentLength == 2) {
            this.label_content.string = "<color=#58210A>嫔妾给皇上请安，现在是</c><color=#FF8C8C>" + this._selContent[0] + "</c><color=#58210A>的</c><color=#FF8C8C>" + this._selContent[1] + "</c><color=#58210A>，我们一起...</c>";
            this.label_select.string = "请选择事件...";
        } else if (contentLength == 3) {
            this.label_content.string = "<color=#58210A>嫔妾给皇上请安，现在是</c><color=#FF8C8C>" + this._selContent[0] + "</c><color=#58210A>的</c><color=#FF8C8C>" + this._selContent[1] + "</c><color=#58210A>，我们一起</c><color=#FF8C8C>" + this._selContent[2] + ".</c>";
            this.label_select.string = "";
        }
    },

    playAni() {
        this.image_event0.node.runAction(cc.sequence([
            cc.fadeOut(this._aniTime),
            cc.delayTime(this._delayTime),
            cc.fadeIn(this._aniTime)
        ]));

        this.image_event1.node.runAction(cc.sequence([
            cc.fadeOut(this._aniTime),
            cc.delayTime(this._delayTime),
            cc.fadeIn(this._aniTime)
        ]));

        this.image_event2.node.runAction(cc.sequence([
            cc.fadeOut(this._aniTime),
            cc.spawn([
                cc.delayTime(this._delayTime),
                cc.callFunc(function () {
                    this.updateView();
                }, this),
            ]),
            cc.fadeIn(this._aniTime)
        ]));
    },

    onGW2C_AckTryst(msgid, data) {
        if (data.result != 0) {
            this.showTips("约会失败...");
        }
    },

    onSeleceX(event,data) {
        if (this._selIds.length >= this._maxStep) {
            return;
        } else {
            this._selIds.push(this.eventList[data].DateId);
            this._selContent.push(this.eventList[data].DateName);
            if (this._selIds.length < this._maxStep) {
                this._curStep += 1;
                this.playAni();
            }
            if (this._selIds.length == this._maxStep) {
                this.node_back.active = true;
                Game.NetWorkController.Send('msg.C2GW_ReqLuckily', {
                    palaceid: Game.PalaceModel.GetCurPalaceId(),
                    story: this._selIds
                });
            }
            this.updateDialog();
        } 
    },
});
