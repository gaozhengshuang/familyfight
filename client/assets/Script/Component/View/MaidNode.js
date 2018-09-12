import addGoldPrefab from  "AddGoldNode"
import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        maid_img: { default: null, type: cc.Sprite },
        addgold_Prefab: { default: null, type: addGoldPrefab},
    },

    onLoad() {
        this.initData();
        this.initEvent();
        this.initView();
    },

    start() {
    },

    update(dt) {
        this.mainTime += dt;
        if (this.mainTime >= this.intervalTime) {
            this.mainTime = 0;
            this.updatePosAndAni();
        }

        this.node.setLocalZOrder(-this.node.y);
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

        this.isLongclick = false;

        this.parentNode = null;
        this.maidBase = {};
    },

    initEvent() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.touchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.touchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
    },

    touchStart(event) {
        this.updateEvent(true);
    },

    touchMove(event) {
        var delta = event.touch.getDelta();
        this.node.x += delta.x;
        this.node.y += delta.y;
    },

    touchEnd(event) {
        this.updateEvent(false);

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.MERGE_PLAYER, this.node);
    },

    touchCancel(event) {
        this.updateEvent(false);
    },

    initView() {
        //创建金币动画
        this.addgold_Node = this.addgold_Prefab.getComponent('AddGoldNode');
    },

    setParentAndData(parentNode, data) {
        this.parentNode = parentNode;
        this.moveMaxX = (parentNode.width / 2) - (this.node.width / 2);
        this.moveMaxY = (parentNode.height / 2) - (this.node.height / 2);
        this.moveMinX = -this.moveMaxX;
        this.moveMinY = -this.moveMaxY;
        
        this.node.x = this.moveMinX + Math.floor(Math.random() * (this.moveMaxX - this.moveMinX + 1));
        this.node.y = this.moveMinY + Math.floor(Math.random() * (this.moveMaxY - this.moveMinY + 1));

        this.maidBase = Game.ConfigController.GetConfigById("TMaidLevel", data);
        if (this.maidBase) {
            this.addgold_Node.updateGold(this.maidBase.Reward);
        }
        Game.ResController.SetSprite(this.maid_img, this.maidBase.Path);
    },

    getMaidBase() {
        return this.maidBase;
    },

    updateEvent(isClick) {
        this.isLongclick = isClick;
        if (this.isLongclick) {
            this.maid_img.node.scaleX = 1.2;
            this.maid_img.node.scaleY = 1.2;
        } else {
            this.maid_img.node.scaleX = 1;
            this.maid_img.node.scaleY = 1;
        }
    },

    updatePosAndAni() {
        if (this.isLongclick) {
            return;
        }

        if (this.node.x > this.moveMaxX || this.node.x < this.moveMinX || this.node.y > this.moveMaxY || this.node.y < this.moveMinY) {
            let resetX = 0;
            let resetY = 0;

            if (this.node.x > this.moveMaxX) {
                resetX = 200;
            }
            if (this.node.x < this.moveMinX) {
                resetX = 100;
            }
            if (this.node.y > this.moveMaxY) {
                resetY = 200;
            }
            if (this.node.y < this.moveMaxY) {
                resetY = 100;
            }
            this.node.runAction(cc.moveTo(0.2, resetX, resetY));
            return;
        }

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
            this.updatePosAndAni();
        }
    }
});
