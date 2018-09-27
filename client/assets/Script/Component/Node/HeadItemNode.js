let Game = require('../../Game');
const moveSpeed = 300;
cc.Class({
    extends: require('viewCell'),

    properties: {
        headSprite: { default: null, type: cc.Sprite },
        nameLabel: { default: null, type: cc.Label },

        data: { default: null },
        target: { default: null }
    },
    init(index, data, reload, group) {
        this.target = data.target;
        if (index >= data.array.length) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.data = data.array[index];
        Game.ResController.GetSpriteFrameByName(this.data.HeadPath, function (err, res) {
            if (!err) {
                this.headSprite.spriteFrame = res;
            }
        }.bind(this));
        this.nameLabel.string = this.data.Name;
    },
    onItemClick: function () {
        if (this.node.active) {
            Game.Tools.InvokeCallback(this.target.onHeadItemClick.bind(this.target), this.data)
        }
    },
});
