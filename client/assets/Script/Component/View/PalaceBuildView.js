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
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
        if (palaceMapBase) {
            Game.ResController.SetSprite(this.image_palaceCard, palaceMapBase.BannerPath);
        }
    }
});
