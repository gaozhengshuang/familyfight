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

    initView: function () {
        this.tableView.getComponent(cc.tableView).initTableView(10, { array: [0,1,2,3,4,5,6,7,8,9], target: this });
    },
});
