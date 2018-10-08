const addGoldPrefab = require('../Node/AddGoldNode');
const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        prefab_addgold: { default: null, type: addGoldPrefab },

        id: { default: null },
    },

    onLoad() {
        this.initEvent();
        this.initView();
    },

    start() {
        this.updateView(this._data);
        this.updatePosAndAni();
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

        Game.NotificationController.Emit(Game.Define.EVENT_KEY.MERGE_PLAYER, this);
    },

    touchCancel(event) {
        this.updateEvent(false);
    },

    initView() {
        //创建金币动画
        this.node_addgold = this.prefab_addgold.getComponent('AddGoldNode');
    },

    updateView(id) {
        this.id = id;
        this.maidBase = Game.ConfigController.GetConfigById("TMaidLevel", id);
        if (this.maidBase) {
            this.node_addgold.updateGold(this.maidBase.Reward);
            Game.ResController.SetSprite(this.image_maid, this.maidBase.Path);
        }
    },

    setData(parentNode, posComponent, data) {
        this.moveDistance = 30;
        this.mainTime = 0;
        this.intervalTime = 2.0;
        this.isLongclick = false;
        this.maidBase = {};

        this.parentNode = parentNode;
        this.moveMaxX = (parentNode.width / 2) - (this.node.width / 2);
        this.moveMaxY = (parentNode.height / 2) - (this.node.height / 2);
        this.moveMinX = -this.moveMaxX;
        this.moveMinY = -this.moveMaxY;

        if (posComponent != null && posComponent.node != null) {
            this.node.x = posComponent.node.x;
            this.node.y = posComponent.node.y;
        } else {
            this.node.x = this.moveMinX + Math.floor(Math.random() * (this.moveMaxX - this.moveMinX + 1));
            this.node.y = this.moveMinY + Math.floor(Math.random() * (this.moveMaxY - this.moveMinY + 1));
        }

        this._data = data;
    },

    getPlayerId() {
        return this.maidBase.Id;
    },

    getMaidBase() {
        return this.maidBase;
    },

    updateEvent(isClick) {
        this.isLongclick = isClick;
        if (this.isLongclick) {
            this.image_maid.node.scaleX = 1.2;
            this.image_maid.node.scaleY = 1.2;
        } else {
            this.image_maid.node.scaleX = 1;
            this.image_maid.node.scaleY = 1;
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
                resetX = this.moveMaxX / 2;
            }
            if (this.node.x < this.moveMinX) {
                resetX = this.moveMinX / 2;
            }
            if (this.node.y > this.moveMaxY) {
                resetY = this.moveMaxY / 2;
            }
            if (this.node.y < this.moveMinY) {
                resetY = this.moveMinY / 2;
            }
            this.node.runAction(cc.moveTo(0.2, resetX, resetY));
            return;
        }

        let targetX = 0;
        let targetY = 0;

        let ranNum = Math.random();
        let distance = Math.floor(ranNum * this.moveDistance + 10);

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
                this.image_maid.node.scaleX = 1;
            } else {
                this.image_maid.node.scaleX = -1;
            }
            this.node.runAction(cc.sequence([
                cc.moveTo(this.intervalTime / 2, targetX, targetY),
                cc.scaleTo(0.1, 1, 0.8),
                cc.scaleTo(0.1, 1, 1),
                cc.callFunc(function () {
                    this.node_addgold.playGoldAni();
                }, this)
            ]));
        } else {
            this.updatePosAndAni();
        }
    },

});
