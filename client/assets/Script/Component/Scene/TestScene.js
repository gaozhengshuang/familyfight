let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: { default: null, type: cc.Prefab }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },
    start() {
    },
    update(dt) {
    },
    onStartTest: function () {
        Game.GameController.ShowDialogue(this.node, 1);
    }
});
