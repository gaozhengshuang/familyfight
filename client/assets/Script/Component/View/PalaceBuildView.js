const Game = require('../../Game');

const PartsType = {
    screen: 0,                 //屏风
    lantern: 1,                 //灯笼
    window: 2,                 //栏窗
    chair: 3,                 //客椅
    carpet: 4,                 //地毯
}

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_charmnum: { default: null, type: cc.Label },
        label_maidPercentage: { default: null, type: cc.Label },
        image_palaceCard: { default: null, type: cc.Sprite },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        // Game.NetWorkController.RemoveListener('msg.GW2C_AckTenSecond', this, this.onGW2C_AckTenSecond);
    },

    initData() {

    },

    initNotification() {
        // Game.NetWorkController.AddListener('msg.GW2C_AckTenSecond', this, this.onGW2C_AckTenSecond);
    },

});
