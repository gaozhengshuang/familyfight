import Game from '../../Game';

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        label_maid: { default: null, type: cc.Label },
        label_gold: { default: null, type: cc.Label }
    },

    // use this for initialization
    onLoad() {

    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
    },

    clicked() {

    }
});
