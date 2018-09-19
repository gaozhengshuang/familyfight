const Game = require('../../Game');

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
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initView() {
        this.updateTableView();
    },

    updateTableView() {
        let passList = [];
        let passBase = Game.ConfigController.GetConfig("PassLevels");
        for (let i = 0; i < passBase.length; i ++) {
            let info = passBase[i];
            if (info.Id <= Game.MaidModel.GetTopPass()) {
                passList.push(info);
            }
        }
        this.tableView.getComponent(cc.tableView).initTableView(passList.length, { array: passList, target: this });
        this.tableView.getComponent(cc.tableView).scrollToRight(1);
    },
});
