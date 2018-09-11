cc.Class({
    extends: cc.Component,

    properties: {
        maid_img: { default: null, type: cc.Sprite },
        addgold_Node: { default: null, type: cc.Object },
        addgold_Prefab: { default: null, type: cc.Prefab },
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
        //创建金币动画
        let addGold = cc.instantiate(this.addgold_Prefab);
        addGold.parent = this.node;
        this.addgold_Node = addGold.getComponent('AddGoldNode');
    },
});
