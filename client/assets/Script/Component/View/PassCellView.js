cc.Class({
    extends: require('viewCell'),

    properties: {
        passClickTrue_img: { default: null, type: cc.Sprite },
        pass_img: { default: null, type: cc.Sprite }
    },

    // use this for initialization
    onLoad: function () {

    },

    init: function (index, data, reload, group) {
        console.log(index);

        this._target = data.target;
        this._data = data.array[index];
    },

    clicked: function () {

    }
});
