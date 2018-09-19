const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.initNotification();
        this.initData();
    },

    start() {
        this.updateView();
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initData() {
        this.passList = [];
        this.passBase = Game.ConfigController.GetConfig("PassLevels");
    },

    updateView() {
        this.updateTableView();
    },

    updateTableView() {
        if (this.passBase) {
            this.passList = [];
            for (let i = 0; i < this.passBase.length; i ++) {
                let info = this.passBase[i];
                if (info.Id <= Game.MaidModel.GetTopPass()) {
                    this.passList.push(info);
                }
            }
            this.tableView.getComponent(cc.tableView).initTableView(this.passList.length, { array: this.passList, target: this });
            this.tableView.getComponent(cc.tableView).scrollToRight(1);
        }
    },
});
