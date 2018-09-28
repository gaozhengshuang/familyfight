const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.initData();
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

    initData() {
        this.tableViewComponent = this.tableView.getComponent(cc.tableView);
        this._tableList = Game._.sortBy(Game.MaidModel.GetShopMaids(), function(maid) {
            return maid.id;
        });
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initView() {
        this.tableViewComponent.initTableView(this._tableList.length, { array: this._tableList, target: this });
        this.tableViewComponent.scrollToBottom();
    },

    updateTableView() {
        this._tableList = Game._.sortBy(Game.MaidModel.GetShopMaids(), function(maid) {
            return maid.id;
        });
        this.tableViewComponent.updateTableView({ array: this._tableList, target: this });
    },
});
