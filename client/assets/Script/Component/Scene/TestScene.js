
cc.Class({
    extends: cc.Component,

    properties: {
        dialogPrefab: { default: null, type: cc.Prefab }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
    },
    start() {
    },
    update(dt) {
    },
    onStartTest: function () {
        let node = cc.instantiate(this.dialogPrefab);
        let dialogView = node.getComponent('DialogView');
        this.node.addChild(node);
        dialogView.Init(1);
    }
});
