const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        image_gold: { default: null, type: cc.Sprite },
        label_gold: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
        this.initView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    initData() {
        this.initY = 0;
    },

    initView() {
        this.initY = this.node.y;
        this.node.active = false;
    },

    updateGold(gold) {
        let _gold = Game.Tools.toLocalMoney(Game.Tools.toBigIntMoney(gold).multiply(2));
        this.label_gold.string = `+${Game.Tools.UnitConvert(_gold)}`;
    },

    playGoldAni() {
        this.node.active = true;
        this.node.y = this.initY;
        this.node.runAction(cc.sequence([
            cc.moveTo(1.0, this.node.x, this.node.y + 50),
            cc.callFunc(function () {
                this.node.active = false;
            }, this)
        ]));
    },

    addGoldAndDestroy(gold) {
        let _scale = 1;
        let _gold = 0;

        if (Math.ceil(Math.random() * 10) <= 2) {
            _scale = 1.4;
            _gold = Game.Tools.toLocalMoney(Game.Tools.toBigIntMoney(gold).multiply(100));
            this.label_gold.string = `暴击+${Game.Tools.UnitConvert(_gold)}`;
        } else {
            _scale = 1;
            _gold = Game.Tools.toLocalMoney(Game.Tools.toBigIntMoney(gold).multiply(2));
            this.label_gold.string = `+${Game.Tools.UnitConvert(_gold)}`;
        }
        Game.CurrencyModel.AddGold(_gold);

        this.node.active = true;
        this.node.scale = _scale;
        this.node.y = this.initY;
        this.node.runAction(cc.sequence([
            cc.moveTo(1.0, this.node.x, this.node.y + 50),
            cc.callFunc(function () {
                this.node.destroy();
            }, this)
        ]));
    }
});
