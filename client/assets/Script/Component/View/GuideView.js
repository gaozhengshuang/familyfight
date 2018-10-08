const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        node_dailogbox: { default: null, type: cc.Node },
        node_guideChild: { default: null, type: cc.Node },
        node_arrow: { default: null, type: cc.Node },
        label_dialog: { default: null, type: cc.Label },
    },

    onLoad() {
        this.guideBase = null;
        this.guideNode = null;
        this.isFind = false;
    },

    start() {
        this.updateGuide();
    },

    update(dt) {
        if (this.isFind) {
            this.updateView();
        }
    },

    updateGuide() {
        this.guideBase = Game.ConfigController.GetConfigById("Guide", Game.GuideController.GetGuide());
        if (this.guideBase) {
            this.isFind = true;
        }
    },

    updateView() {
        switch (this.guideBase.Type) {
            case 0:     //仆人和轿子的引导
                this.isFind = false;
                break;

            case 1:     //点击目标的引导
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    let canvas = cc.director.getScene().getChildByName('Canvas');
                    this.guideNode = canvas.getChildByName("GameSceneView").getChildByName(this.guideBase.ButtonName);
                } else {
                    Game.ViewController.openView(this.guideBase.prefab);
                    this.guideNode = Game.ViewController.seekChildByName(this.guideBase.prefab, this.guideBase.ButtonName);
                }
                
                if (this.guideNode) {   //找到节点设置手指指向的位置
                    this.isFind = false;
                    this.node_arrow.x = this.guideNode.x;
                    this.node_arrow.y = this.guideNode.y;

                    this.guideNode.parent = this.node_guideChild;
                }
                break;

            case 2:     //点击任意处关闭的引导
                this.isFind = false;
                break;
        }

        this.label_dialog.string = this.guideBase.Dialog;
    },
});
