const Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        tipParentNode: { default: null, type: cc.Node },
        notifyPrefab: { default: null, type: cc.Prefab },
        rewardPrefab: { default: null, type: cc.Prefab },
        barragePositionIndex: { default: 0, type: cc.Integer },
    },

    onLoad() {
        cc.game.addPersistRootNode(this.node);
    },

    start() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.TIP_TIPS, this, this.onShowTips);
        Game.NotificationController.On(Game.Define.EVENT_KEY.TIP_REWARD, this, this.onShowReward);
    },

    update(dt) {
    },

    //漂浮提示代码--------------------------------------start-----------------------------------
    onShowTips(data) {
        if (this.notifyPrefab) {
            let toast = cc.instantiate(this.notifyPrefab);
            toast.x = 0;
            toast.y = 0;
            toast.parent = this.tipParentNode;
            let toastView = toast.getComponent('NotifyView');
            toastView.flap(data.text || '<color=#907360>' + data + '</color>', data.alive || 3, data.delay || 0.1);
        }
    },
    //漂浮提示代码--------------------------------------end-------------------------------------
    //奖励提示代码--------------------------------------start-----------------------------------
    onShowReward(data) {
        if (this.rewardPrefab) {
            let node = cc.instantiate(this.rewardPrefab);
            node.position = cc.v2(0, 0);
            this.tipParentNode.addChild(node);
            let view = node.getComponent('TipRewardView');
            view.flap(data.info, data.alive, data.delay);
        }
    },
    //奖励提示代码--------------------------------------end-------------------------------------
});
