cc.Class({
    extends: cc.Component,

    properties: {
        gold_img: { default: null, type: cc.Sprite },
        gold_txt: { default: null, type: cc.Label },
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

    playGoldAni() {
        this.node.active = true;
        this.node.y = this.initY;
        this.node.runAction(cc.sequence([
            cc.moveTo(1.0, this.node.x, this.node.y + 50),
            cc.callFunc(function () {
                this.node.active = false;
            }, this)
        ]));
    }
});
