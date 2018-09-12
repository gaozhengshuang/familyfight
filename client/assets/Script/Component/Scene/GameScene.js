import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        btn_shop: { default: null, type: cc.Button },
        node_maid: { default: null, type: cc.Node},
        prefab_player: {default: null, type: cc.Prefab},
    },

    onLoad() {
        this.initData();
        this.initView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    initData() {

    },

    initView() {
        let _view = cc.instantiate(this.prefab_player);
        this.node_maid.addChild(_view);

        let xx = _view.getComponent('MaidNode');
        xx.setParentAndData(this.node_maid, 1);
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
    },
});
