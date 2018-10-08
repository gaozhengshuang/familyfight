const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_dailogbox: { default: null, type: cc.Node },
        node_guideChild: { default: null, type: cc.Node },
        node_arrow: { default: null, type: cc.Node },
        label_dailog: { default: null, type: cc.Label },
    },

    onEnable() {
    },

    update(dt) {
    },

    onDisable() {
    },
});
