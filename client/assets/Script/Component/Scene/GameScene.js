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
        let guideBase = Game.ConfigController.GetConfigById("Guide", Game.GuideController.GetGuide());
        if (guideBase) {
            if (guideBase.NextGuide != 0) {
                cc.loader.loadRes("Prefab/GuideView", function (err, prefab) {
                    let _view = cc.instantiate(prefab);
                    if (_view) {
                        this.GuideLayer.addChild(_view);
                    }
                }.bind(this));
            }
        }
    },
});
