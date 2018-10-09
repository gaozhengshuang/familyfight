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
        this._oldGuide = 0;

        this.initNotification();
    },

    start() {
        this.updateGuide();
    },

    update(dt) {
        if (this.isFind) {
            this.updateView();
        }
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateGuide);
    },

    updateGuide() {
        if (this._oldGuide != 0 && this.guideNode != null) {    //把父节点变化过的按钮还回去
            let oldGuideBase = Game.ConfigController.GetConfigById("Guide", this._oldGuide);
            if (oldGuideBase && oldGuideBase.Type == 1) {
                let newParent = null;
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    newParent = cc.director.getScene().getChildByName('Canvas').getChildByName("GameSceneView");
                } else {
                    newParent = Game.ViewController.getViewByName(oldGuideBase.prefab);
                }

                let oldWorldPosition = this.guideNode.parent.convertToWorldSpaceAR(this.guideNode.position);
                let newWordPosition = newParent.convertToNodeSpaceAR(oldWorldPosition);
                this.guideNode.position = newWordPosition;
                this.guideNode.parent = newParent;
            }
        }
        this._oldGuide = Game.GuideController.GetGuide();

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
                break;

            case 2:     //点击任意处关闭的引导
                this.isFind = false;
                break;
        }

        if (this.guideNode) {   //找到节点设置手指指向的位置
            this.isFind = false;

            let oldWorldPosition = this.guideNode.parent.convertToWorldSpaceAR(this.guideNode.position);
            let newWordPosition = this.node_guideChild.convertToNodeSpaceAR(oldWorldPosition);
            this.guideNode.position = newWordPosition;
            this.guideNode.parent = this.node_guideChild;

            this.node_arrow.x = newWordPosition.x;
            this.node_arrow.y = newWordPosition.y;
        }

        this.node_arrow.active = this.guideBase.IsFinger == 1;
        this.label_dialog.string = this.guideBase.Dialog;
    },
});
