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
        if (this.guideBase) {    //关闭界面把按钮重置节点
            if (this.guideBase.NextGuide == 0) {
                if (this._oldParent != null && this.guideNodes.length > 0) {
                    this.resetNode(this._oldParent);
                }
                this.node.destroy();
            } else {
                if (this.guideBase.Type == 2) {
                    Game.GuideController.NextGuide();
                }
            }
        }
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateGuide);
    },

    resetNode(tagretParent) {
        let oldWorldPosition = null;
        let newWordPosition = null;

        for (let i = 0; i < this.guideNodes.length; i++) {
            let guideNode = this.guideNodes[i];

            if (guideNode && guideNode.parent != null) {
                oldWorldPosition = guideNode.parent.convertToWorldSpaceAR(guideNode.position);
                newWordPosition = tagretParent.convertToNodeSpaceAR(oldWorldPosition);
                guideNode.position = newWordPosition;
                guideNode.parent = tagretParent;
            }
        }

        if (newWordPosition) {   //设置手指位置(多个位置暂时不支持)
            this.node_arrow.x = newWordPosition.x;
            this.node_arrow.y = newWordPosition.y;
        }
    },

    updateGuide() {
        if (this._oldParent != null && this.guideNodes.length > 0) {    //把父节点变化过的按钮还回去
            this.resetNode(this._oldParent);
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
        let gameSceneViewNode = canvas.getChildByName("GameSceneView");
        let gameSceneView = gameSceneViewNode.getComponent('GameSceneView');
        switch (this.guideBase.Type) {
            case 1:     //点击目标的引导
                if (this.guideBase.prefab == "Prefab/GameSceneView") {
                    guideNode = Game.ViewController.seekChildByName(canvas.getChildByName("GameSceneView"), this.guideBase.ButtonName);
                } else {
                    guideNode = Game.ViewController.seekChildByName(Game.ViewController.getViewByName(this.guideBase.prefab), this.guideBase.ButtonName);
                }
                
                if (guideNode) {
                    this.guideNodes.push(guideNode);
                    this._oldParent = guideNode.parent;     //记录之前的父节点
                }
                break;

            case 2:     //点击任意处关闭的引导
                this.isFind = false;
                if (this.guideBase.FingerXY) {
                    let _fingerpos = this.guideBase.FingerXY.split(",");   //手指位置
                    if (_fingerpos.length > 0) {
                        this.node_arrow.x = Number(_fingerpos[0]);
                        this.node_arrow.y = Number(_fingerpos[1]);
                    }
                }
                break;

            case 3:     //轿子引导
                this.isFind = false;
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
                if (guideNode) {
                    this.guideNodes.push(guideNode);
                    this._oldParent = guideNode.parent;     //记录之前的父节点
                }
                break;
            case 4:     //侍女
                this.isFind = false;
                if (gameSceneView == null) {
                    break;
                }
                let maidInfos = (this.guideBase.MaidInfo || '').split('_');
                let maidList = gameSceneView.getMaidById(parseInt(maidInfos[0] || '1'), parseInt(maidInfos[1] || '1'));
                if (maidList == null || maidList.length == 0) {
                    break;
                }
                for (let i = 0; i < maidList.length; i++) {
                    let maidNode = maidList[i];
                    maidNode.node.stopAllActions();
                    this.guideNodes.push(maidNode.node);
                    this._oldParent = maidNode.node.parent;     //记录之前的父节点
                }
                break;
            default:
                break;
        }

        if (this.guideNodes.length > 0) {
            this.isFind = false;
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
