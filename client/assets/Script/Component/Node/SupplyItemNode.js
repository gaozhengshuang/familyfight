let Game = require('../../Game');
cc.Class({
    extends: cc.viewCell,
    properties: {
        normalNode: { default: null, type: cc.Node },
        selectedNode: { default: null, type: cc.Node },
        iconSprite: { default: null, type: cc.Sprite },
        countLabel: { default: null, type: cc.Label },

        target: { default: null },
        data: { default: null },
        index: { default: 0 }
    },
    onLoad() {
    },
    start() {
    },
    update(dt) {
    },
    init(index, data, reload, group) {
        this.target = data.target;
        this.index = index;
        if (index >= data.array.length) {
            this.countLabel.string = '';
            this.iconSprite.spriteFrame = null;
            this.selectedNode.active = false;
            this.data = null;
            return;
        }
        this.data = data.array[index];
        let resName = Game._.get(this.data, 'config.Itempath', '');
        if (resName != null) {
            Game.ResController.GetSpriteFrameByName(resName, function (err, res) {
                if (!err) {
                    this.iconSprite.spriteFrame = res;
                }
            }.bind(this));
        }
        this.countLabel.string = this.data.num;
        this.selectedNode.active = (data.selectid == this.data.itemid);
    },
    onItemClick: function () {
        if (this.data != null) {
            //点击了
            Game.Tools.InvokeCallback(this.target.onSupplyItemClick, this.index);
        }
    },
    Select: function () {
        if (this.data != null) {
            this.selectedNode.active = true;
        }
    },
    Unselect: function () {
        if (this.data != null) {
            this.selectedNode.active = false;
        }
    },
    GetId: function () {
        return Game._.get(this, 'data.itemid', -1);
    }
});
