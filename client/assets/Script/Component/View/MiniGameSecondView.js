const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_second: { default: null, type: cc.Label },
        label_btnStart: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    update(dt) {
    },

    onEnable() {
        this.initNotification();
        this.initView();
    },

    onDisable() {
        // Game.NotificationController.Off(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initData() {
        
    },

    initNotification() {
        // Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initView() {
        
    },

    onClickStartOrStop() {
        
    }
});
