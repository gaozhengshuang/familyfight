const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        shopCells: { default: [], type: [require('../Node/ShopCellNode')] }
    },

    onLoad() {
    },

    update(dt) {
    },

    onEnable() {
        this.initNotification();
        this.initView();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    onClose() {
        this.closeView(this._url);
        Game.GuideController.NextGuide();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initView() {
    },

    updateTableView() {
        let pass = Game.MaidModel.curPass;
        let maidList = Game.MaidModel.GetMaidsByPass(pass);
    },
});
