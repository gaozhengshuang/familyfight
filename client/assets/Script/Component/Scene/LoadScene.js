let Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        percentLabel: { default: null, type: cc.Label },
        loaded: { default: [], type: cc.Boolean },
        targetCanvas: { default: null, type: cc.Canvas },
        loadProgressBar: { default: null, type: cc.ProgressBar },
    },

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);
        this.loaded = false;

        Game.NotificationController.On(Game.Define.EVENT_KEY.CONNECT_TO_GATESERVER, this, this.onLoginComplete);
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.CONNECT_TO_GATESERVER, this, this.onLoginComplete);
    },

    start() {
    },

    update(dt) {
        if (Game.GameInstance == null || Game.GameInstance.totalCount == 0 || this.loaded) {
            return;
        }
        let percent = (Game.GameInstance.loadingCount / Game.GameInstance.totalCount).toFixed(2);
        this.percentLabel.string = Math.ceil(percent * 100) + '%';
        this.loadProgressBar.progress = percent;
        if (Game.GameInstance.loadingCount == Game.GameInstance.totalCount) {
            //加载完了
            this.loaded = true;
            // Game.Platform.AutoLogin();
            this.onLoginComplete();
        }
    },

    onLoginComplete() {
        cc.director.loadScene("GameScene");
    },
});
