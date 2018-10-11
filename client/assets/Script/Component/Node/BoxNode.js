let Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        clickButton: { default: null, type: cc.Button },
        animation: { default: null, type: cc.Animation },
        _parentNode: { default: null, type: cc.Node },
        _clickFunc: { default: null },
    },
    onLoad: function () {
        this.animation.on('stop', this.onAnimationStop, this);
    },
    onDestroy: function () {
        this.animation.off('stop', this.onAnimationStop, this);
    },
    update: function (dt) {
        this.node.setLocalZOrder(-this.node.y);
    },
    onItemClick: function () {
        Game.Tools.InvokeCallback(this._clickFunc, this)
        this.disableClick();
        Game.NetWorkController.Send('msg.C2GW_ReqOpenBox', { id: this._data, num: 1 });
    },
    setData: function (parentNode, data, clickFunc) {
        this._data = data;
        this._clickFunc = clickFunc;
        this._parentNode = parentNode;
        let moveMaxX = (parentNode.width / 2) - (this.node.width / 2);
        let moveMaxY = (parentNode.height / 2) - (this.node.height / 2);
        let moveMinX = -moveMaxX;
        let moveMinY = -moveMaxY;
        moveMaxY -= 200;

        let targetX = moveMinX + Math.floor(Math.random() * (moveMaxX - moveMinX + 1));
        let targetY = moveMinY + Math.floor(Math.random() * (moveMaxY - moveMinY + 1));
        this.node.x = targetX;
        this.node.y = targetY + 200;
        this.opacity = 0
        this.node.runAction(cc.sequence([
            cc.spawn([
                cc.moveBy(0.2, 0, -200),
                cc.fadeTo(0.2, 255)
            ]),
            cc.scaleTo(0.1, 1.1, 0.9),
            cc.scaleTo(0.1, 1, 1)
        ]));
        // this.node.runAction(cc.moveBy(0.2, 0, -1280));
    },
    playOpenAnimation: function () {
        let spr = this.node.getComponent(cc.Sprite);
        spr.enabled = false;
        this.animation.play('OpenBox');
    },
    onAnimationStop: function () {
        this.node.destroy();
    },
    disableClick: function () {
        this.clickButton.interactable = false;
    },
    enableClick: function () {
        this.clickButton.interactable = true;
    },
});
