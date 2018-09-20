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
    },
    update(dt) {
    },
    onStartTest: function () {
        // let info = this.inputEditbox.string;
        let info = JSON.stringify({
            a: 1,
            b: [2, 3],
            c: {
                d: 4,
                e: [
                    {
                        f: 5,
                        g: 6
                    }, {
                        h: 7
                    }
                ]
            }
        });
        let str = Game.Crypto.AESEncrypt(info);
        this.infoLabel.string = str;
    },
    onStartTest2: function () {
        let info = this.infoLabel.string;
        let str = Game.Crypto.AESDecrypt(info);
        console.log(JSON.parse(str));
        this.infoLabel.string = str;
    }
});
