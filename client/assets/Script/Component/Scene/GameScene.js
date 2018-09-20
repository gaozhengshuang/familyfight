const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        targetCanvas: { default: null, type: cc.Canvas },
    },

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);
    },

    start() {

    },

    update(dt) {
    },

    onDestroy() {

    },
});
