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
        this.updateView();
    },

    onDisable() {
        // Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    initData() {
        this._data = null;
    },

    initNotification() {
        // Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        if (this._data) {
        }
    },

    onGoLove() {
        
    }
});
