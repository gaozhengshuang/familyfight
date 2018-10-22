const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_lovenum: { default: null, type: cc.Label },
        label_lovePercentage: { default: null, type: cc.Label },
        label_canLovenum: { default: null, type: cc.Label },
        label_name: { default: null, type: cc.Label },
        label_content: { default: null, type: cc.Label },
        image_head: { default: null, type: cc.Sprite },
        image_queen: { default: null, type: cc.Sprite },
        image_king: { default: null, type: cc.Sprite },
        image_leftCurtains: { default: null, type: cc.Sprite },
        image_rightCurtains: { default: null, type: cc.Sprite },
        image_topCurtains: { default: null, type: cc.Sprite },
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
        // Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    initData() {
        this._data = null;
        this._topCurtainsPos = this.image_topCurtains.node.getPosition();
        this._leftCurtainsPos = this.image_leftCurtains.node.getPosition();
        this._rightCurtainsPos = this.image_rightCurtains.node.getPosition();

        this._moveTime = 1.0;
        this._delayTime = 2.0;
    },

    initNotification() {
        // Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    initView() {
        //初始化帘子
        this.image_topCurtains.node.setPosition(this._topCurtainsPos);
        this.image_leftCurtains.node.setPosition(this._leftCurtainsPos);
        this.image_rightCurtains.node.setPosition(this._rightCurtainsPos);
        this.image_topCurtains.node.opacity = 0;
        this.image_leftCurtains.node.opacity = 0;
        this.image_rightCurtains.node.opacity = 0;
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        if (this._data) {
        }
    },

    onGoLove() {
        this.image_topCurtains.node.runAction(cc.sequence([
            cc.spawn([
                cc.moveTo(this._moveTime, this.image_topCurtains.node.x, this.image_topCurtains.node.y - this.image_topCurtains.node.height),
                cc.fadeIn(this._moveTime)
            ]),
            cc.delayTime(this._delayTime),
            cc.spawn([
                cc.moveTo(this._moveTime, this._topCurtainsPos.x, this._topCurtainsPos.y),
                cc.fadeOut(this._moveTime)
            ]),
        ]));

        this.image_leftCurtains.node.runAction(cc.sequence([
            cc.spawn([
                cc.moveTo(this._moveTime, this.image_leftCurtains.node.x + this.image_leftCurtains.node.width, this.image_leftCurtains.node.y),
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
                cc.moveTo(this._moveTime, this.image_rightCurtains.node.x - this.image_rightCurtains.node.width, this.image_rightCurtains.node.y),
                cc.fadeIn(this._moveTime)
            ]),
            cc.delayTime(this._delayTime),
            cc.spawn([
                cc.moveTo(this._moveTime, this._rightCurtainsPos.x, this._rightCurtainsPos.y),
                cc.fadeOut(this._moveTime)
            ]),
        ]));
    }
});
