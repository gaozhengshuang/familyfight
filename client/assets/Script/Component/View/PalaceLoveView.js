const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_lovenum: { default: null, type: cc.Label },
        label_lovePercentage: { default: null, type: cc.Label },
        label_canLovenum: { default: null, type: cc.Label },
        label_name: { default: null, type: cc.Label },
        label_content: { default: null, type: cc.Label },
        label_percentage: { default: null, type: cc.Label },
        image_head: { default: null, type: cc.Sprite },
        image_queen: { default: null, type: cc.Sprite },
        image_king: { default: null, type: cc.Sprite },
        image_leftCurtains: { default: null, type: cc.Sprite },
        image_rightCurtains: { default: null, type: cc.Sprite },
        node_topCurtains: { default: null, type: cc.Node },
        node_dialog: { default: null, type: cc.Node },
        node_share: { default: null, type: cc.Node },
        node_mask: { default: null, type: cc.Node },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.initView();
        this.updateView();
    },

    onDisable() {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckLuckily', this, this.onGW2C_AckLuckily);
    },

    initData() {
        this._data = null;
        this._leftCurtainsPos = this.image_leftCurtains.node.getPosition();
        this._rightCurtainsPos = this.image_rightCurtains.node.getPosition();

        this._moveTime = 1.0;
        this._delayTime = 2.0;
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.GW2C_AckLuckily', this, this.onGW2C_AckLuckily);
    },

    initView() {
        //初始化帘子
        let viewSize = cc.view.getVisibleSize()
        this.node_dialog.y = -(viewSize.height / 2);
        this.node_topCurtains.y = viewSize.height / 2;
        this.image_leftCurtains.node.setPosition(this._leftCurtainsPos);
        this.image_rightCurtains.node.setPosition(this._rightCurtainsPos);
        this.node_topCurtains.opacity = 0;
        this.image_leftCurtains.node.opacity = 0;
        this.image_rightCurtains.node.opacity = 0;
        this.node_mask.active = false;
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        if (this._data) {
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
            if (palaceMapBase) {
                let maidBase = Game.ConfigController.GetConfigById("PalacePersonnel", palaceMapBase.Master);
                if (maidBase) {
                    Game.ResController.SetSprite(this.image_queen, maidBase.WholeBodyPath);
                }
            }

            let dialogList = [];
            let loveDialogueList = Game.ConfigController.GetConfig("LoveDialogue");
            for (let i = 0; i < loveDialogueList.length; i++) {
                if (loveDialogueList[i].PalaceId == this._data.id) {
                    dialogList.push(loveDialogueList[i]);
                }
            }
            let dialogueBase = dialogList[Math.floor(Math.random() * dialogList.length)];
            if (dialogueBase) {
                this.label_name.string = dialogueBase.Name;
                this.label_content.string = dialogueBase.Content;
                Game.ResController.SetSprite(this.image_head, dialogueBase.Headpath);
            }

            this.label_lovenum.string = `${this._data.luckily}`;
            this.label_lovePercentage.string = `${this._data.luckily}%`;
            this.label_percentage.string = `第${this._data.id}章节效率提升`;
            this.label_canLovenum.string = `临幸x${Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.LUCKILY)}`;
        }
    },

    onGW2C_AckLuckily(msgid, data) {
        if (data.result == 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.MAKELOVE_ACK);

            Game.RewardController.PlayLastReward(function () {
                this.updateView();
            }.bind(this));
        } else {
            this.showTips("侍寝失败...");
        }
    },

    onGoLove() {
        if (Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.LUCKILY) < 1) {
            this.showTips("前去翻牌子获得游戏次数");
            return;
        }
        this.node_mask.active = true;
        this.playMakeLoveAction();
    },
    onShare() {
        Game.Platform.ShareMessage(Game.Define.SHARETYPE.ShareType_MiniGame, Game.Define.MINIGAMETYPE.LUCKILY, Game.TimeController.GetCurTime());
    },

    playMakeLoveAction() {
        this.node_topCurtains.runAction(cc.sequence([
            cc.spawn([
                cc.moveBy(this._moveTime, 0, -this.node_topCurtains.height),
                cc.fadeIn(this._moveTime)
            ]),
            cc.delayTime(this._delayTime),
            cc.spawn([
                cc.moveBy(this._moveTime, 0, this.node_topCurtains.height),
                cc.fadeOut(this._moveTime)
            ]),
        ]));
        let viewSize = cc.view.getVisibleSize();
        this.image_leftCurtains.node.runAction(cc.sequence([
            cc.spawn([
                cc.moveTo(this._moveTime, this.image_leftCurtains.node.x + viewSize.width / 2, this.image_leftCurtains.node.y),
                cc.fadeIn(this._moveTime)
            ]),
            cc.delayTime(this._delayTime),
            cc.spawn([
                cc.moveTo(this._moveTime, this._leftCurtainsPos.x, this._leftCurtainsPos.y),
                cc.fadeOut(this._moveTime)
            ]),
        ]));

        this.image_rightCurtains.node.runAction(cc.sequence([
            cc.spawn([
                cc.moveTo(this._moveTime, this.image_rightCurtains.node.x - viewSize.width / 2, this.image_rightCurtains.node.y),
                cc.fadeIn(this._moveTime)
            ]),
            cc.delayTime(this._delayTime),
            cc.spawn([
                cc.moveTo(this._moveTime, this._rightCurtainsPos.x, this._rightCurtainsPos.y),
                cc.fadeOut(this._moveTime)
            ]),
        ]));

        this.node_dialog.runAction(cc.sequence([
            cc.spawn([
                cc.moveBy(this._moveTime, 0, -this.node_dialog.height),
                cc.fadeOut(this._moveTime)
            ]),
            cc.delayTime(this._delayTime),
            cc.callFunc(function () {
                this.node_mask.active = false;
                Game.NetWorkController.Send('msg.C2GW_ReqLuckily', {
                    palaceid: Game.PalaceModel.GetCurPalaceId(),
                });
            }, this),
            cc.spawn([
                cc.moveBy(this._moveTime, 0, this.node_dialog.height),
                cc.fadeIn(this._moveTime)
            ]),
        ]));
    },
});
