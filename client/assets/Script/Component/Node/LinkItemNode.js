let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        backNode: { default: null, type: cc.Node },
        frontNode: { default: null, type: cc.Node },
        frontSprite: { default: null, type: cc.Sprite },

        index: { default: 0 },
        value: { default: 0 },
        clickFunc: { default: null },
    },

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    },
    onDestroy: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    },
    onTouchStart: function () {
        Game.Tools.InvokeCallback(this.clickFunc, this.index);
    },
    Init: function (index, value, clickFunc) {
        this.index = index;
        this.value = value;
        this.clickFunc = clickFunc;
        Game.ResController.GetSpriteFrameByName('Image/ActiveView/image_linkitem' + value + '.png', function (err, res) {
            if (err != null) {
                console.log('[严重错误] 加载资源错误 ' + JSON.stringify(err));
            } else {
                this.frontSprite.spriteFrame = res;
            }
        }.bind(this));
    },
    TurnBackWithAnima: function (turnDelay, cb) {
        this.backNode.stopAllActions();
        this.frontNode.stopAllActions();
        if (turnDelay == null && turnDelay == 0.0) {
            //不播动画
            this.frontNode.active = false;
            this.backNode.scaleX = 1;
        } else {
            //播动画
            this.frontNode.runAction(cc.sequence(
                cc.scaleTo(turnDelay / 2, 0, 1),
                cc.callFunc(function () {
                    this.frontNode.active = false;
                    this.backNode.scaleX = 0;
                    this.backNode.runAction(cc.sequence([
                        cc.scaleTo(turnDelay / 2, 1, 1),
                        cc.callFunc(function () {
                            Game.Tools.InvokeCallback(cb);
                        }, this)
                    ]));
                }, this)
            ));
        }
    },
    TurnFrontWithAnima: function (turnDelay, cb) {
        this.backNode.stopAllActions();
        this.frontNode.stopAllActions();
        if (turnDelay == null && turnDelay == 0.0) {
            //不播动画
            this.frontNode.active = true;
            this.frontNode.scaleX = 1;
        } else {
            //播动画
            this.backNode.runAction(cc.sequence(
                cc.scaleTo(turnDelay / 2, 0, 1),
                cc.callFunc(function () {
                    this.frontNode.active = true;
                    this.frontNode.scaleX = 0;
                    this.frontNode.runAction(cc.sequence([
                        cc.scaleTo(turnDelay / 2, 1, 1),
                        cc.callFunc(function () {
                            Game.Tools.InvokeCallback(cb);
                        }, this)
                    ]));
                }, this)
            ));
        }
    },
    SetOpacity: function (opacity) {
        this.node.opacity = opacity;
    },
    StopAllAction: function () {
        this.backNode.stopAllActions();
        this.frontNode.stopAllActions();
    }
});
