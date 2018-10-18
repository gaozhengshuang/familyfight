const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        button_part: { default: null, type: cc.Button },
        label_partAndLv: { default: null, type: cc.Label },
        label_gold: { default: null, type: cc.Label },
        partId: { default: 0 }
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.initView();
    },

    onDisable() {
        // Game.NetWorkController.RemoveListener('msg.GW2C_AckTenSecond', this, this.onGW2C_AckTenSecond);
    },

    initData() {
        this._data = null;
    },

    initNotification() {
        // Game.NetWorkController.AddListener('msg.GW2C_AckTenSecond', this, this.onGW2C_AckTenSecond);
    },

    initView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
    },

    onOpenDetail() {
    },
});
