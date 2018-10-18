const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        node_playDlg: { default: null, type: cc.Node }
    },

    onLoad() {
    },

    onEnable() {
        if (!Game.GuideController.IsGuide()) {
            let scale = this.getPnlScale();
            this.node_playDlg.runAction(cc.sequence(
                cc.scaleTo(0, scale / 2),
                cc.scaleTo(0.6, scale).easing(cc.easeElasticOut(0.7))
            ));
        }
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    getPnlScale() {
        return this.node_playDlg.scale;
    },
});
