const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_head: { default: null, type: cc.Sprite },
        node_event0: { default: null, type: cc.Node },
        node_event1: { default: null, type: cc.Node },
        node_event2: { default: null, type: cc.Node },
        image_event0: { default: null, type: cc.Sprite },
        image_event1: { default: null, type: cc.Sprite },
        image_event2: { default: null, type: cc.Sprite },
        button_event0: { default: null, type: cc.Button },
        button_event1: { default: null, type: cc.Button },
        button_event2: { default: null, type: cc.Button },
        label_event0: { default: null, type: cc.Label },
        label_event1: { default: null, type: cc.Label },
        label_event2: { default: null, type: cc.Label },
        label_select: { default: null, type: cc.Label },
        label_name: { default: null, type: cc.Label },
        label_content: { default: null, type: cc.RichText },
        node_back: { default: null, type: cc.Node },
        node_share: { default: null, type: cc.Node },
        button_date: { default: null, type: cc.Button },
        label_canDateNum: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.initView();
        this.updateMiniGameCoin();
    },

    onDisable() {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckTryst', this, this.onGW2C_AckTryst);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },

    initData() {
        this._aniTime = 1.0;
        this._delayTime = 1.0;
        this._maxStep = 3;
        this._eventNum = 3;
        this.dateEventList = Game.ConfigController.GetConfig("DateEvent");
    },

    initView() {
        this.node_event0.opacity = 0;
        this.node_event1.opacity = 0;
        this.node_event2.opacity = 0;

        this.button_event0.interactable = false;
        this.button_event1.interactable = false;
        this.button_event2.interactable = false;

        this.node_back.active = true;
        this.node_share.active = true;
        this.button_date.node.active = true;
        
        this.image_head.node.color = cc.Color.BLACK;
        this.label_name.string = "";
        this.label_content.string = "<color=#58210A>点击即可随机跟后宫佳丽约会...</c><color=#FF8C8C>";
    },

    gameAgainView() {
        this.node_event0.opacity = 0;
        this.node_event1.opacity = 0;
        this.node_event2.opacity = 0;

        this.node_event0.runAction(cc.sequence([
            cc.fadeIn(this._aniTime),
            cc.callFunc(function () {
                this.button_event0.interactable = true;
            }, this)
        ]));
        this.node_event1.runAction(cc.sequence([
            cc.fadeIn(this._aniTime),
            cc.callFunc(function () {
                this.button_event1.interactable = true;
            }, this)
        ]));
        this.node_event2.runAction(cc.sequence([
            cc.fadeIn(this._aniTime),
            cc.callFunc(function () {
                this.button_event2.interactable = true;
            }, this)
        ]));

        this.node_back.active = false;
        this.button_date.node.active = false;
        this.node_share.active = false;
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.GW2C_AckTryst', this, this.onGW2C_AckTryst);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },

    updateView() {
        if (this._data) {
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
            if (palaceMapBase) {
                let maidBase = Game.ConfigController.GetConfigById("PalacePersonnel", palaceMapBase.Master);
                if (maidBase) {
                    this.label_name.string = maidBase.Name;
                    Game.ResController.SetSprite(this.image_head, maidBase.Path);
                    this.image_head.node.color = cc.Color.WHITE;
                }
            }

            this.eventList = [];

            for (let i = 0; i < this.dateEventList.length; i++) {
                if (this.dateEventList[i].Datetype == this._curStep) {
                    this.eventList.push(this.dateEventList[i]);
                }
            }
            this.eventList = Game._.sampleSize(this.eventList, this._eventNum);
            for (let n = 0; n < this.eventList.length; n++) {
                let eventBase = this.eventList[n];
                Game.ResController.SetSprite(this["image_event" + n], eventBase.Datepath);
                this["label_event" + n].string = eventBase.DateName;
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
        this.button_event0.interactable = false;
        this.button_event1.interactable = false;
        this.button_event2.interactable = false;
        this.node_share.active = this._selIds.length >= this._maxStep;
        for (let i = 0; i < this._maxStep; i++) {
            if (this._selIds.length < this._maxStep) {
                this.playGoingAni(i);
            } else {
                this.playEndAni(i);
            }
        }
    },

    playGoingAni(idx) {
        this["node_event" + idx].runAction(cc.sequence([
            cc.fadeOut(this._aniTime),
            cc.spawn([
                cc.delayTime(this._delayTime),
                cc.callFunc(function () {
                    if (idx == (this._maxStep - 1)) {
                        this.updateView();
                    }
                }, this),
            ]),
            cc.fadeIn(this._aniTime),
            cc.callFunc(function () {
                if (idx == (this._maxStep - 1)) {
                    this.button_event0.interactable = true;
                    this.button_event1.interactable = true;
                    this.button_event2.interactable = true;
                }
            }, this)
        ]));
    },

    playEndAni(idx) {
        let _fadeOut = cc.fadeOut(this._aniTime);
        let _spawn1 = cc.spawn([
            cc.delayTime(this._delayTime + idx * 0.3),
            cc.callFunc(function () {
                this["node_event" + idx].scale = 1.3;
                let eventBase = Game._.find(this.dateEventList, { DateId: this._selIds[idx] });
                if (eventBase) {
                    Game.ResController.SetSprite(this["image_event" + idx], eventBase.Datepath);
                    this["label_event" + idx].string = eventBase.DateName;
                }
            }, this),
        ]);
        let _spawn2 = cc.spawn([
            cc.scaleTo(this._aniTime, 1, 1),
            cc.fadeIn(this._aniTime),
        ]);
        let _fadeIn = cc.fadeIn(this._aniTime);
        let _callFunc = cc.callFunc(function () {
            if (idx == (this._maxStep - 1)) {
                this.node_back.active = true;
                this.node_share.active = true;
                this.button_date.node.active = true;
                Game.NetWorkController.Send('msg.C2GW_ReqTryst', {
                    palaceid: this._data.id,
                    key: this._selIds[0] << 20 | this._selIds[1] << 10 | this._selIds[2]
                });
            }

        }, this);

        this["node_event" + idx].runAction(cc.sequence([_fadeOut, _spawn1, _spawn2, _fadeIn, _callFunc]));
    },

    onGW2C_AckTryst(msgid, data) {
        if (data.result == 0) {
            Game.RewardController.PlayLastReward(function () {
                if (Game.ActiveController.CanGetReward(Game.Define.SHARETYPE.ShareType_Tryst, 0, Game.TimeController.GetCurTime())) {
                    this.openView(Game.UIName.UI_SHAREAWARD, {
                        sharetype: Game.Define.SHARETYPE.ShareType_Tryst,
                        shareid: 0
                    });
                }
            }.bind(this));
        } else {
            this.showTips("约会失败...");
        }
    },

    onStartGame() {
        this._selIds = [];
        this._selContent = [];
        this._curStep = 1;
        
        this._data = Game.PalaceModel.palaceDatas[Math.floor(Math.random() * Game.PalaceModel.palaceDatas.length)]; //随机出一个宫殿

        this.gameAgainView();
        this.updateView();
        this.updateDialog();
    },


    onSeleceX(event, data) {
        if (this._selIds.length >= this._maxStep) {
            return;
        } else {
            this._curStep += 1;
            this._selIds.push(this.eventList[data].DateId);
            this._selContent.push(this.eventList[data].DateName);
            this.playAni();
            this.updateDialog();
        }
    },

    onShare() {
        Game.Platform.ShareMessage(Game.Define.SHARETYPE.ShareType_MiniGame, Game.Define.MINIGAMETYPE.TRYST, Game.TimeController.GetCurTime());
    },

    updateMiniGameCoin() {  
        this.label_canDateNum.string = `随机约会x${Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.TRYST)}`;
    },
});
