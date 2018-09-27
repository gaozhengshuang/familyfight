let Game = require('../../Game');
cc.Class({
    extends: require('viewCell'),

    properties: {
        eventSprite: { default: null, type: cc.Sprite },
        idLabel: { default: null, type: cc.Label },

        eventData: { default: null },
        target: { default: null }
    },
    init: function (index, data, reload, group) {
        this.target = data.target;
        if (index >= data.array.length) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.eventData = data.array[index];
        if (this._checkEventOpen()) {
            Game.ResController.GetSpriteFrameByName(this.eventData.EventPath, function (err, res) {
                if (!err) {
                    this.eventSprite.spriteFrame = res;
                }
            }.bind(this));
        } else {
            this.eventSprite.spriteFrame = null;
        }
        this.idLabel.string = Game.Tools.zeroPadding(this.eventData.Id, 3);
    },
    onItemClick: function () {
        // if (this._checkEventOpen()) {
        //     //打开事件吧
        // } else {
        //     //提示
        // }
        // this.openView(Game.UIName.UI_EVENTDETAILVIEW);
        Game.Tools.InvokeCallback(this.target.onItemClick.bind(this.target), this.eventData.Id)
    },
    _checkEventOpen: function () {
        return this.eventData != null && Game.TravelModel.IsEventOpen(this.eventData.Id);
    }
});
