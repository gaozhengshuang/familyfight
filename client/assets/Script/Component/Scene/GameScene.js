import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        btn_shop: { default: null, type: cc.Button },
        node_maid: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
        txt_gold: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
        this.initNotification();
        this.initView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
    },

    initData() {
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
    },

    initView() {
        let _view = cc.instantiate(this.prefab_player);
        this.node_maid.addChild(_view);

        let xx = _view.getComponent('MaidNode');
        xx.setParentAndData(this.node_maid, 1);

        _view = cc.instantiate(this.prefab_player);
        this.node_maid.addChild(_view);

        xx = _view.getComponent('MaidNode');
        xx.setParentAndData(this.node_maid, 1);
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
    },

    updateGold(gold) {
        this.txt_gold.string = `${gold}`;
    }
});
