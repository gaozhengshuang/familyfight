let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        inputEditbox: { default: null, type: cc.EditBox },
        infoLabel: { default: null, type: cc.Label }
    },
    onLoad() {
    },
    start() {
        let a = [{
            a: 1,
            b: 1,
        }, {
            b: 1,
            c: 2,
        }, {
            c: 2,
            d: 3
        }];
        console.log(Game._.filter(a, { c: 2 }));
    },
    update(dt) {
    },
    onStartTest: function () {
        // let info = this.inputEditbox.string;
    },
    onStartTest2: function () {
        let info = this.infoLabel.string;
        let str = Game.Crypto.AESDecrypt(info);
        console.log(JSON.parse(str));
        this.infoLabel.string = str;
    }
});
