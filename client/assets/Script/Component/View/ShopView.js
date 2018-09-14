import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.initView();
        this.initNotification();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MAID_UPDATESHOP, this, this.updateTableView);
    },

    initView() {
        this.updateTableView();
    },

    updateTableView() {
        this.tableView.getComponent(cc.tableView).initTableView(Game.MaidModel.GetShopMaids().length, { array: Game.MaidModel.GetShopMaids(), target: this });
    },

    onClose() {
        this.node.destroy();
    }
});
