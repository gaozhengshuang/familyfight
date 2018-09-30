let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        anima: { default: null, type: dragonBones.ArmatureDisplay }
    },
    onLoad() {
    },
    start() {
    },
    update(dt) {
    },
    onStartTest: function () {
        this.anima.playAnimation('newAnimation');
    },
    onStartTest2: function () {
    }
});
