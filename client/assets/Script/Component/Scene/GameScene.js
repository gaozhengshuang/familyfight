const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        targetCanvas: { default: null, type: cc.Canvas },
        GuideLayer: { default: null, type: cc.Node },
    },

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);
    },

    start() {
        this.openGuide();
    },

    update(dt) {
    },

    onDestroy() {

    },

    openGuide() {
        cc.loader.loadRes("Prefab/GuideView", function (err, prefab) {
            let _view = cc.instantiate(prefab);
            if (_view) {
                _view.active = Game.GuideController.IsGuide();
                this.GuideLayer.addChild(_view);
            }
        }.bind(this));
    },
});
