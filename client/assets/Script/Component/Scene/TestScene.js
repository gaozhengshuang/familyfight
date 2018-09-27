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
        let a = [1, 2, 3, 4, 5];
        console.log(a.shift());
        console.log(a);
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
