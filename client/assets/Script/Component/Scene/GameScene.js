const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        targetCanvas: { default: null, type: cc.Canvas },
        GuideLayer: { default: null, type: cc.Node },
    },

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);
        this.initData();
    },

    start() {
        this.onGameListener();
        this.openGuide();
    },

    update(dt) {
        if (!Game.LoginController.isOnLine()) {
            this.curInterval += dt;
            if (this.curInterval >= this.intervalTime) {
                this.curInterval = 0;
                Game.Platform.AutoLogin();
            }
        }
    },

    initData() {
        this.curInterval = 0;
        this.intervalTime = 2.0;    //本地检测是否断线时间(如果发现断线就立即重连)
    },

    openGuide() {
        cc.loader.loadRes("Prefab/GuideView", function (err, prefab) {
            let _view = cc.instantiate(prefab);
            if (_view) {
                this.GuideLayer.addChild(_view);
                _view.active = Game.GuideController.IsGuide() && Game.CurrencyModel.offLineReward == null;
            }
        }.bind(this));
    },

    onGameListener() {
        // cc.game.on(cc.game.EVENT_HIDE, function() {
        //     console.log("游戏进入后台");
        // }, this);
        // cc.game.on(cc.game.EVENT_SHOW, function() {
        //     console.log("重新返回游戏");
        //     Game.Platform.AutoLogin();
        // }, this);
    },
});
