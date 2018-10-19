let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        anima: { default: null, type: dragonBones.ArmatureDisplay }
    },
    onLoad() {
    },
    start() {
        let a = [
            {
                b: 1,
                c: 2,
            },
            {
                d: 3,
            },
            {
                e: 4
            }
        ]
        let x = {};
        Game._.map(a, function (o) {
            x = Game._.merge(x, o);
        })
        console.log(x);
    },
    update(dt) {
    },
    onStartTest: function () {
        this.anima.playAnimation('newAnimation');
    },
    onStartTest2: function () {
    }
});
