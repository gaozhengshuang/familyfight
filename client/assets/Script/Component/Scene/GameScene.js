cc.Class({
    extends: cc.Component,

    properties: {
        btn_shop: { default: null, type: cc.Button },
        node_maid: { default: null, type: cc.Node},
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
        cc.loader.loadRes("Prefab/MaidNode", function (err, prefab) {
            if (err) {
                console.log('[严重错误] 奖励资源加载错误 ' + err);
            } else {
                let _view = cc.instantiate(prefab);
                this.node_maid.addChild(_view);

                let xx = _view.getComponent('MaidNode');
                xx.initPos(this.node_maid);
            }
        }.bind(this));
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
    },
});
