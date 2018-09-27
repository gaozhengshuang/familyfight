let Game = require('../../Game');
const moveSpeed = 100;
cc.Class({
    extends: cc.Component,

    properties: {
        headSprite: { default: null, type: cc.Sprite },
        nameLabel: { default: null, type: cc.Label },
        contentLabel: { default: null, type: cc.Label },

        index: { default: 0 },
        info: { default: null },
        closeFunc: { default: null }
    },
    update: function (dt) {
        let addition = moveSpeed * dt;
        this.node.x -= addition;
        if (this.node.x < -370 - this.node.width) {
            this.node.destroy();
        }
    },
    onDestroy: function () {
        Game.Tools.InvokeCallback(this.closeFunc, this.info);
    },
    Init: function (info, posY, closeFunc) {
        this.info = info;
        this.closeFunc = closeFunc;
        let infos = info.split('_');
        let id = parseInt(infos[0]);
        let headConfig = Game.TravelModel.GetHeadConfig(id);
        Game.ResController.GetSpriteFrameByName(headConfig.HeadPath, function (err, res) {
            if (!err) {
                this.headSprite.spriteFrame = res;
            }
        }.bind(this));
        this.nameLabel.string = headConfig.Name + ':';
        this.contentLabel.string = infos[1];
        this.node.position = cc.v2(360, posY);
    },
    GetPosXWithRight: function () {
        return this.node.x + this.node.width;
    }
});
