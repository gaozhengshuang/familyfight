import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        node_player: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
        label_gold: { default: null, type: cc.Label },

        prefab_Shop: { default: null, type: cc.Prefab },
    },

    onLoad() {
        this.initData();
        this.initNotification();
        this.initView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
    },

    initData() {
        this._playerList = [];
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
    },

    initView() {
        for (let i = 0; i < 20; i ++) {
            let _view1 = cc.instantiate(this.prefab_player);
            this.node_player.addChild(_view1);
            let xx1 = _view1.getComponent('PlayerNode');
            xx1.setParentAndData(this.node_player, 1);
            this._playerList.push(xx1);
        }
    },

    findPlayerAndMerge(_player) {
        for (let i = 0; i < this._playerList.length; i ++) {
            let findPlayer = this._playerList[i];

            if (_player.node.uuid != findPlayer.node.uuid) {
                if (_player.node.getBoundingBox().intersects(findPlayer.node.getBoundingBox())) {
                    if (_player.getPlayerId() == findPlayer.getPlayerId()) {
                        findPlayer.node.removeFromParent();
                        this._playerList.splice(i,1);

                        _player.levelUp();
                        break;
                    }
                }
            }
        }
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
        let shopView = cc.instantiate(this.prefab_Shop);
        if (shopView) {
            this.node.addChild(shopView);
        }
    },

    updateGold(gold) {
        this.label_gold.string = `${gold}`;
    }
});
