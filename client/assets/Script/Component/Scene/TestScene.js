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
        console.log(parseInt('1'))
        console.log(parseInt(2))

        let x = { a: 1, b: 2 };
        let y = { c: 3, b: 4 };
        console.log(Game._.merge(x, y));
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
