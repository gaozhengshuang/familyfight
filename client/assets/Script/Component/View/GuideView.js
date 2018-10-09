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
        this.guideNodes = [];
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

    onClose() {
        if (this.guideBase) {    //关闭界面把按钮重置节点
            if (this.guideBase.NextGuide == 0) {
                if (this._oldGuide != 0 && this.guideNodes.length > 0) {
                    let oldGuideBase = Game.ConfigController.GetConfigById("Guide", this._oldGuide);
                    let newParent = null;
                    if (oldGuideBase && oldGuideBase.Type == 1) {
                        if (this.guideBase.prefab == "Prefab/GameSceneView") {
                            newParent = cc.director.getScene().getChildByName('Canvas').getChildByName("GameSceneView");
                        } else {
                            newParent = Game.ViewController.getViewByName(oldGuideBase.prefab);
                        }
                    }
                    this.resetNode(newParent);
                }
                this.node.destroy();
            }
        }
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateGuide);
    },

    resetNode(newParent) {
        let oldWorldPosition = null;
        let newWordPosition = null;

        for (let i = 0; i < this.guideNodes.length; i++) {
            let guideNode = this.guideNodes[i];

            oldWorldPosition = guideNode.parent.convertToWorldSpaceAR(guideNode.position);
            newWordPosition = newParent.convertToNodeSpaceAR(oldWorldPosition);
            guideNode.position = newWordPosition;
            guideNode.parent = newParent;
        }

        if (newWordPosition) {   //设置手指位置(多个位置暂时不支持)
            this.node_arrow.x = newWordPosition.x;
            this.node_arrow.y = newWordPosition.y;
        }
    },

    updateGuide() {
        if (this._oldGuide != 0 && this.guideNodes.length > 0) {    //把父节点变化过的按钮还回去
            let oldGuideBase = Game.ConfigController.GetConfigById("Guide", this._oldGuide);
            let newParent = null;
            if (oldGuideBase && oldGuideBase.Type == 1) {
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    newParent = cc.director.getScene().getChildByName('Canvas').getChildByName("GameSceneView");
                } else {
                    newParent = Game.ViewController.getViewByName(oldGuideBase.prefab);
                }
            }
            this.resetNode(newParent);
        }
        this._oldGuide = Game.GuideController.GetGuide();

        this.guideBase = Game.ConfigController.GetConfigById("Guide", Game.GuideController.GetGuide());
        if (this.guideBase) {
            this.isFind = true;
        }
    },

    updateView() {
        this.guideNodes = [];
        let guideNode = null;
        let canvas = cc.director.getScene().getChildByName('Canvas');
        switch (this.guideBase.Type) {
            case 1:     //点击目标的引导
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    guideNode = canvas.getChildByName("GameSceneView").getChildByName(this.guideBase.ButtonName);
                } else {
                    guideNode = Game.ViewController.seekChildByName(this.guideBase.prefab, this.guideBase.ButtonName);
                }
                break;

            case 2:     //点击任意处关闭的引导
                this.isFind = false;
                break;

            case 3:     //轿子引导
                this.isFind = false;
                let gameSceneViewNode = canvas.getChildByName("GameSceneView");
                if (gameSceneViewNode == null) {
                    break;
                }
                let gameSceneView = gameSceneViewNode.getComponent('GameSceneView');
                if (gameSceneView == null) {
                    break;
                }
                let boxList = gameSceneView.getBox(1);
                if (boxList == null || boxList.length == 0) {
                    break;
                }
                guideNode = boxList[0].node;
                if (guideNode == null) {
                    break;
                }
                guideNode.stopAllActions();
                break;
            case 4:     //侍女
                this.isFind = false;
                let gameSceneViewNode = canvas.getChildByName("GameSceneView");
                if (gameSceneViewNode == null) {
                    break;
                }
                let gameSceneView = gameSceneViewNode.getComponent('GameSceneView');
                if (gameSceneView == null) {
                    break;
                }
                let maidInfo = this.guideBase.MaidInfo;
                let maidList = gameSceneView.getMaidById();
                if (boxList == null || boxList.length == 0) {
                    break;
                }
                guideNode = boxList[0].node;
                if (guideNode == null) {
                    break;
                }
                guideNode.stopAllActions();
                break;
            default:
                break;
        }

        if (guideNode) {   //打开引导页面
            this.guideNodes.push(guideNode);
            this.isFind = false;
            Game.ViewController.openView(this.guideBase.prefab);
            this.resetNode(this.node_guideChild);
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
