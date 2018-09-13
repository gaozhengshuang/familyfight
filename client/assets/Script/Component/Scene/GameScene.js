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
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
    },

    initData() {
        this._playerList = [];
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
    },

    initView() {
        for (let i = 0; i < 10; i ++) {
            this.createPlayer(i+1);
        }
    },

    createPlayer(playerId) {
        let _playerPrefab = cc.instantiate(this.prefab_player);
        this.node_player.addChild(_playerPrefab);

        let _player = _playerPrefab.getComponent('PlayerNode');
        _player.setParentAndData(this.node_player, playerId);
        this._playerList.push(_player);
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
