let Game = require('../../Game');
cc.Class({
    extends: cc.Component,
    properties: {
        headSprite: { default: null, type: cc.Sprite },
        nameLabel: { default: null, type: cc.Label },
        backNode: { default: null, type: cc.Node },
        frontNode: { default: null, type: cc.Node }
    },
    onLoad: function () {
    },
    start: function () {
    },
    update: function (dt) {
    },
    Init: function (head, name) {
        Game.ResController.GetSpriteFrameByName(head, function (err, res) {
            if (err != null) {
                console.log('[严重错误] 加载资源错误 ' + JSON.stringify(err));
            } else {
                this.headSprite.spriteFrame = res;
            }
        }.bind(this));
        this.nameLabel.string = name;
    },
    TurnBackWithAnima: function (turnDelay) {
        this.backNode.stopAllActions();
        this.frontNode.stopAllActions();
        if (turnDelay == null && turnDelay == 0.0) {
            //不播动画
            this.frontNode.active = false;
            this.backNode.active = true;
            this.backNode.scaleX = 1;
        } else {
            //播动画
            this.frontNode.runAction(cc.sequence(
                cc.scaleTo(turnDelay / 2, 0, 1),
                cc.callFunc(function () {
                    this.frontNode.active = false;
                    this.backNode.active = true;
                    this.backNode.scaleX = 0;
                    this.backNode.runAction(
                        cc.scaleTo(turnDelay / 2, 1, 1)
                    );
                }, this)
            ));
        }
    },
    TurnFrontWithAnima: function (turnDelay) {
        this.backNode.stopAllActions();
        this.frontNode.stopAllActions();
        if (turnDelay == null && turnDelay == 0.0) {
            //不播动画
            this.frontNode.active = true;
            this.backNode.active = false;
            this.frontNode.scaleX = 1;
        } else {
            //播动画
            this.backNode.runAction(cc.sequence(
                cc.scaleTo(turnDelay / 2, 0, 1),
                cc.callFunc(function () {
                    this.backNode.active = false;
                    this.frontNode.active = true;
                    this.frontNode.scaleX = 0;
                    this.frontNode.runAction(
                        cc.scaleTo(turnDelay / 2, 1, 1)
                    );
                }, this)
            ));
        }
    }
});
