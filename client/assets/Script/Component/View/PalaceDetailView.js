const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_mainView: { default: null, type: cc.Node },
        image_master: { default: null, type: cc.Sprite },
        image_palaceCard: { default: null, type: cc.Sprite },
        image_get: { default: null, type: cc.Sprite },
        label_get: { default: null, type: cc.Label },
        label_getTime: { default: null, type: cc.Label },
        image_lvUp: { default: null, type: cc.Sprite },
        label_needLvItem: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    update(dt) {
    },

    initData() {
        this._data = null;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetPalaceId());
    },

    onOpenLvUp() {
        this.openView(Game.UIName.UI_PALACEMASTERLVUP);
    },
});
