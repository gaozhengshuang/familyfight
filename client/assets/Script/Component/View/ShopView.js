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
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    onClose() {
        this.closeView(this._url);
        Game.GuideController.NextGuide();
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initView() {
        this.updateTableView();
    },

    updateTableView() {
        let pass = Game.MaidModel.GetCurPass();
        let maidList = Game.MaidModel.GetMaidsByPass(pass);
        for (let i = 0; i < this.shopCells.length; i++) {
            let cell = this.shopCells[i];
            let maid = maidList[i];
            if (maid == null) {
                cell.node.active = false;
                continue;
            }
            cell.node.active = true;
            let shop = Game._.find(Game.MaidModel._shopMaids, { id: maid.Id });
            cell.init(maid, shop);
        }
    },
});
