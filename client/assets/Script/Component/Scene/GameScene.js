
cc.Class({
    extends: cc.Component,

    properties: {
        btn_shop: { default: null, type: cc.Button },
        node_maid: { default: null, type: cc.Node},
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

    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
    },
});
