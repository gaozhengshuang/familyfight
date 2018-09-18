import Game from '../../Game';

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.uiType = Game.Define.UI_KEY.LAYER;
        
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
        let _tbList = Game._.sortBy(Game.MaidModel.GetShopMaids(), function(maid) {
            return maid.id;
        });
        this.tableView.getComponent(cc.tableView).initTableView(_tbList.length, { array: _tbList, target: this });
    },

    onClose() {
        this.closeView(Game.UIName.UI_SHOP);
    }
});
