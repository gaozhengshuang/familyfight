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
        this._oldParent = null;

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

    onClose() {
        if (this.guideBase) {
            if (this.guideBase.NextGuide == 0) {
                this.resetNode(this._oldParent, this.node_guideChild);
                this.node.destroy();
            }
        }
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateGuide);
    },

    resetNode(oldParent, newParent) {
        let oldWorldPosition = oldParent.parent.convertToWorldSpaceAR(oldParent.position);
        let newWordPosition = newParent.convertToNodeSpaceAR(oldWorldPosition);
        this.guideNode.position = newWordPosition;
        this.guideNode.parent = newParent;

        this.node_arrow.x = newWordPosition.x;
        this.node_arrow.y = newWordPosition.y;
    },

    updateGuide() {
        if (this._oldGuide != 0 && this.guideNode != null) {    //把父节点变化过的按钮还回去
            let oldGuideBase = Game.ConfigController.GetConfigById("Guide", this._oldGuide);
            let newParent = null;
            if (oldGuideBase && oldGuideBase.Type == 1) {
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    newParent = cc.director.getScene().getChildByName('Canvas').getChildByName("GameSceneView");
                } else {
                    newParent = Game.ViewController.getViewByName(oldGuideBase.prefab);
                }
            }
            this.resetNode(this._oldParent, newParent);
        }
        this._oldGuide = Game.GuideController.GetGuide();

        this.guideBase = Game.ConfigController.GetConfigById("Guide", Game.GuideController.GetGuide());
        if (this.guideBase) {
            this.isFind = true;
        }
    },

    updateView() {
        let canvas = cc.director.getScene().getChildByName('Canvas');
        switch (this.guideBase.Type) {
            case 1:     //点击目标的引导
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    this.guideNode = canvas.getChildByName("GameSceneView").getChildByName(this.guideBase.ButtonName);
                } else {
                    this.guideNode = Game.ViewController.seekChildByName(this.guideBase.prefab, this.guideBase.ButtonName);
                }
                break;

            case 2:     //点击任意处关闭的引导
                this.isFind = false;
                break;

            case 3:     //轿子引导
                this.isFind = false;
                let gameSceneViewNode = canvas.getChildByName("GameSceneView");
                let gameSceneView = gameSceneViewNode.getComponent('GameSceneView');
                this.guideNode = gameSceneView.getBox(1)[0].node;
                this.guideNode.stopAllActions();
                break;

            default:
                break;
        }

        if (this.guideNode) {   //打开引导页面 设置手指位置
            this.isFind = false;
            this._oldParent = this.guideNode;

            Game.ViewController.openView(this.guideBase.prefab);            
            this.resetNode(this.guideNode, this.node_guideChild);
        }

        //界面设置
        this.node_arrow.active = this.guideBase.IsFinger == 1;
        this.label_dialog.string = this.guideBase.Dialog;
        let _boxpos = this.guideBase.PersonXY.split(",");   //人物位置
        if (_boxpos.length > 0) {
            this.node_dailogbox.x = Number(_boxpos[0]);
            this.node_dailogbox.y = Number(_boxpos[1]);   
        }
    },
});
