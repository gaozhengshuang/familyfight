const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_second: { default: null, type: cc.Label },
        label_btnStart: { default: null, type: cc.Label },
    },

    update(dt) {
        if (this.isStart) {

        }
    },

    onEnable() {
        this.initData();
        this.initNotification();
        this.initView();
    },

    onDisable() {
        // Game.NotificationController.Off(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initData() {
        this._gameTime = 0;
        this.isStart = false;
    },

    initNotification() {
        // Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initView() {
        if (this.isStart) {
            this.label_btnStart.string = "开始";
        } else {
            this.label_btnStart.string = "停";
        }

        this.refreshTime();
    },

    refreshTime() {

    },

    onClickStartOrStop() {
        if (this.isStart) {
            this.label_btnStart.string = "开始";
        } else {
            this.label_btnStart.string = "停";
        }
        this.isStart = !this.isStart;
    }
});
