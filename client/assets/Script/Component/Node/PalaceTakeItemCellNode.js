const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_item: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },
        label_num: { default: null, type: cc.Label },
    },

    onLoad() {
        this.price = 0;
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        let itemBase = Game.ConfigController.GetConfigById("ItemBaseData", this._data.itemid);
        if (itemBase) {
            Game.ResController.SetSprite(this.image_item, itemBase.Itempath);
            this.label_name.string = itemBase.Name;
            this.label_num.string = "+" + this._data.num;
        }
    },

    clicked() {

    }
});
