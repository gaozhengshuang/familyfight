import addGoldPrefab from  "AddGoldNode"

cc.Class({
    extends: cc.Component,

    properties: {
        maid_img: { default: null, type: cc.Sprite },
        addgold_Prefab: { default: null, type: addGoldPrefab},
    },

    onLoad() {
        this.initData();
        this.initView();
    },

    start() {
        
    },

    update(dt) {
        this.mainTime += dt;
        if (this.mainTime >= this.intervalTime) {
            this.mainTime = 0;
            this.rangePos();
        }
    },

    onDestroy() {
    },

    initData() {
        this.moveMaxX = 0;
        this.moveMaxY = 0;
        this.moveMinX = 0;
        this.moveMinY = 0;
        this.moveDistance = 30;

        this.mainTime = 0;
        this.intervalTime = 2.0;
    },

    initView() {
        //创建金币动画
        this.addgold_Node = this.addgold_Prefab.getComponent('AddGoldNode');
    },

    initPos(parentNode) {
        this.moveMaxX = (parentNode.width / 2) - this.node.width;
        this.moveMaxY = (parentNode.height / 2) - this.node.height;
        this.moveMinX = -this.moveMaxX;
        this.moveMinY = -this.moveMaxY;        
    },

    rangePos() {
        let targetX = 0;
        let targetY = 0;

        let ranNum = Math.random();
        let distance = Math.floor(ranNum*this.moveDistance+10);

        if (ranNum > 0.5) {
            targetX = this.node.x + distance;
        } else {
            targetX = this.node.x - distance;
        }

        ranNum = Math.random();
        if (ranNum > 0.5) {
            targetY = this.node.y + distance;
        } else {
            targetY = this.node.y - distance;
        }

        if (targetX >= this.moveMinX && targetX <= this.moveMaxX && targetY >= this.moveMinY && targetY <= this.moveMaxY) {
            if (targetX >= this.node.x) {
                this.maid_img.node.scaleX = 1;
            } else {
                this.maid_img.node.scaleX = -1;
            }
            this.node.runAction(cc.sequence([
                cc.moveTo(this.intervalTime/2, targetX, targetY),
                cc.scaleTo(0.1, 1, 0.8),
                cc.scaleTo(0.1, 1, 1),
                cc.callFunc(function () {
                    this.addgold_Node.playGoldAni();
                }, this)
            ]));
        } else {
            this.rangePos();
        }
    }
});
