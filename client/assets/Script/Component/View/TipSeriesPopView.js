const Game = require('../../Game');
const SeriesPopStatus = {
    Status_Lock: 1,
    Status_Unlock: 2
};
cc.Class({
    extends: cc.Component,

    properties: {
        popNode: { default: null, type: cc.Node },
        nameLabel: { default: null, type: cc.Label },
        iconSprite: { default: null, type: cc.Sprite },
        countLabel: { default: null, type: cc.Label },

        compeleteFunc: { default: null },
        infos: { default: [] },
        status: { default: SeriesPopStatus.Status_Lock },
        index: { default: 0 }
    },
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    },
    onDestroy: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    },
    onTouchStart: function () {
        if (this.status != SeriesPopStatus.Status_Lock) {
            this.popNode.stopAllActions();
            this.index++;
            this.nextPop();
        }
    },
    Pop: function (infos, compeleteFunc) {
        this.infos = infos || [];
        this.compeleteFunc = compeleteFunc;
        this.nextPop();
    },
    nextPop: function () {
        if (this.index >= this.infos.length) {
            //结束咯
            this.closePop();
        } else {
            let info = this.infos[this.index];
            this.nameLabel.string = info.name;
            this.countLabel.string = '+' + info.count;
            if (info.icon == '') {
                this.iconSprite.spriteFrame = null;
            } else {
                Game.ResController.GetSpriteFrameByName(info.icon, function (err, res) {
                    if (err) {
                        console.error('[严重错误] 加载资源失败 ' + err);
                    } else {
                        this.iconSprite.spriteFrame = res;
                    }
                }.bind(this));
            }
            this.popNode.scaleX = 0;
            this.popNode.scaleY = 0;
            this.status = SeriesPopStatus.Status_Lock;
            this.popNode.runAction(cc.sequence([
                cc.scaleTo(0.2, 1.2, 1.2),
                cc.callFunc(function () {
                    this.status = SeriesPopStatus.Status_Unlock;
                }, this),
                cc.scaleTo(0.12, 0.8, 0.8),
                cc.scaleTo(0.08, 1.1, 1.1),
                cc.scaleTo(0.05, 1, 1),
                cc.delayTime(1),
                cc.callFunc(function () {
                    this.index++;
                    this.nextPop();
                }, this)
            ]));
        }
    },
    closePop: function () {
        Game.Tools.InvokeCallback(this.compeleteFunc);
        this.node.destroy();
    }
});
