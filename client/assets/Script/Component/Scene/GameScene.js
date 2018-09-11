import maidView from '../View/MaidNode';

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
        // cc.loader.loadRes("Prefab/MaidNode", function (err, prefab) {
        //     if (err) {
        //         console.log('[严重错误] 奖励资源加载错误 ' + err);
        //     } else {
        //         let _view = cc.instantiate(prefab);
        //         this.node_maid.addChild(_view);
        //     }
        // }.bind(this));
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
    },
});
