import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.initView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    initView() {
        let passList = [];
        let passBase = Game.ConfigController.GetConfig("PassLevels");
        for (let i = 0; i < passBase.length; i ++) {
            let info = passBase[i];
            if (info.Id <= Game.UserModel.GetTopPass()) {
                passList.push(info);
            }
        }
        this.tableView.getComponent(cc.tableView).initTableView(passList.length, { array: passList, target: this });
    },
});
