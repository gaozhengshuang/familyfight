let Game = require('../../Game');
cc.Class({
    extends: cc.Component,

    properties: {
        animation: { default: null, type: cc.Animation },
        parentNode: { default: null, type: cc.Node },
        _data: { default: null },
        _clickFunc: { default: null }
    },
    onLoad: function () {
        this.animation.on('stop', this.onAnimationStop, this);
    },
    update: function (dt) {
        this.node.setLocalZOrder(-this.node.y);
    },
    onItemClick: function () {
        Game.Tools.InvokeCallback(this._clickFunc, this)
        Game.NetWorkController.Send('msg.C2GW_ReqOpenBox', { id: this._data, num: 1 });
    },
    setData: function (parentNode, data, clickFunc) {
        this._data = data;
        this._clickFunc = clickFunc;
        this.parentNode = parentNode;
        let moveMaxX = (parentNode.width / 2) - (this.node.width / 2);
        let moveMaxY = (parentNode.height / 2) - (this.node.height / 2);
        let moveMinX = -moveMaxX;
        let moveMinY = -moveMaxY;

        let targetX = moveMinX + Math.floor(Math.random() * (moveMaxX - moveMinX + 1));
        let targetY = moveMinY + Math.floor(Math.random() * (moveMaxY - moveMinY + 1));
        this.node.x = targetX;
        this.node.y = targetY + 1280;
        this.node.runAction(cc.moveBy(0.2, 0, -1280));
    },
    playOpenAnimation: function () {
        this.animation.play('OpenBox');
    },
    onAnimationStop: function () {
        this.node.destroy();
    }
});