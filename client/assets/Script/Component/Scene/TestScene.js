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
        // console.log(parseInt('1'))
        // console.log(parseInt(2))

        // let x = { a: 1, b: 2 };
        // let y = { c: 3, b: 4 };
        // console.log(Game._.merge(x, y));

        let info = 'U2FsdGVkX1+eh7ST1Op6F6ZvuS4UJ8c1GUlRMruFCJlkl1Io8rI7m5nIPCaJSgB4hCAogoD0D/VbUZ6bwUpWsIpBA5PfkRJ0iuuOpsmog8jZVqI/lGeAa3Yux9Bm7EmeRvEUXa1q29O/Fa9IIpJ5kroJYf7Do3qmntc7JG8ylPaMjr1XH1hx0fWMfBPdQbv/5/IWetLRiFH+SITIPDMch16QJ66+YcZP+gTggH8gTKs=';
        let str = Game.Crypto.AESDecrypt('FitzHMa42EpbzEmR', 'ZwpkH3ecNj8nnS4W', info);
        console.log(str);
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
