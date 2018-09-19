const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.initNotification();
    },

    onReset() {
        this.updateView();
    },

    start() {
        this.updateView();
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    updateView() {
        this.updateTableView();
    },

    updateTableView() {
        let _tbList = Game._.sortBy(Game.MaidModel.GetShopMaids(), function(maid) {
            return maid.id;
        });
        this.tableView.getComponent(cc.tableView).initTableView(_tbList.length, { array: _tbList, target: this });
    },
});
