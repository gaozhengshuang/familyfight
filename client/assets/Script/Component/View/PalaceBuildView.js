const Game = require('../../Game');

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
        this.updateView();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    initData() {
        this._data = null;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        if (this._data) {
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
            if (palaceMapBase) {
                Game.ResController.SetSprite(this.image_palaceCard, palaceMapBase.BannerPath);
            }
            this.label_charmnum.string = `${this._data.charm}`;
            this.label_maidPercentage.string = `${this._data.charm}%`;
        }
    }
});
