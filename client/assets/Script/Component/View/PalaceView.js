const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        perfab_palace: { default: null, type: cc.Prefab }
    },

    onLoad() {
    },

    onReset() {
        this.updateView();
    },

    start() {
        this.updateView();
    },

    update(dt) {
    },

    onDestroy() {
    },

    updateView() {
        
    },
});
