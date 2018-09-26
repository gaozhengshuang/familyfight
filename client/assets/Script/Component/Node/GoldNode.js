const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        label_gold: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initNotification();
    },

    start() {
        this.updateGold(Game.UserModel.GetGold());
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
    },

    updateGold(gold) {
        this.label_gold.string = `${Game.Tools.UnitConvert(gold)}`;
    }
});
