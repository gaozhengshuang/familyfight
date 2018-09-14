import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        node_player: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
        label_gold: { default: null, type: cc.Label },
        prefab_Shop: { default: null, type: cc.Prefab },
        prefab_FindNewPlayer: { default: null, type: cc.Prefab },
        targetCanvas: { default: null, type: cc.Canvas },
    },

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);

        this.initData();
        this.initNotification();
        this.initView();
    },

    start() {
        let _lookTopPass = cc.sys.localStorage.getItem('lookTopPass');
        if (_lookTopPass == 0 || _lookTopPass == null) {
            this.showDialoguePlayer(1);
            cc.sys.localStorage.setItem('lookTopPass', 1);
        }
    },

    update(dt) {
        this.mainTime += dt;
        if (this.mainTime >= this.synchroTime) {
            this.mainTime = 0;
            Game.NetWorkController.Send('msg.C2GW_UploadTrueGold', {num: Game.UserModel.GetGold()});
        }
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_PLAYER, this, this.updatePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
    },

    initData() {
        this._playerList = [];
        this._touchPlayer = null;
        this._findPlayer = null;
        this._deleteIndex = 0;

        this.mainTime = 0;
        this.synchroTime = 10;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_PLAYER, this, this.updatePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
    },

    initView() {
        this.updatePlayer();
        this.updateGold(Game.UserModel.GetGold());
    },

    updatePlayer() {
        this._playerList = [];
        this.node_player.destroyAllChildren();
        for (let i = 0; i < Game.MaidModel.GetMaids().length; i ++) {
            let player = Game.MaidModel.GetMaids()[i];
            let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", player.id);
            if (maidBase && maidBase.Passlevels == Game.MaidModel.GetCurPass()) {
                for (let b = 0; b < player.count; b ++) {
                    this.createPlayer(player.id);
                }
            }
        }
    },

    createPlayer(playerId) {
        let _playerPrefab = cc.instantiate(this.prefab_player);
        if (_playerPrefab) {
            this.node_player.addChild(_playerPrefab);
            let _player = _playerPrefab.getComponent('PlayerNode');
            if (_player) {
                _player.setParentAndData(this.node_player, this._findPlayer, playerId);
                this._playerList.push(_player);
            }
        }
    },

    findPlayerAndMerge(_player) {
        this._touchPlayer = _player;

        for (let i = 0; i < this._playerList.length; i ++) {
            let findPlayer = this._playerList[i];

            if (this._touchPlayer.node.uuid != findPlayer.node.uuid) {
                if (this._touchPlayer.node.getBoundingBox().intersects(findPlayer.node.getBoundingBox())) {
                    if (this._touchPlayer.getPlayerId() == findPlayer.getPlayerId()) {
                        this._findPlayer = findPlayer;
                        Game.NetWorkController.Send('msg.C2GW_ReqMergeMaid', {maidid: findPlayer.getPlayerId()});
                        break;
                    }
                }
            }
        }
    },

    ackMergePlayer(result) {
        if (result == 0) {
            //删除掉合成成功的女仆
            Game._.remove(this._playerList, function (player) {
                return player.node.uuid == this._touchPlayer.node.uuid || player.node.uuid == this._findPlayer.node.uuid;
            }.bind(this))

            this._touchPlayer.node.destroy();
            this._findPlayer.node.destroy();
            
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
        }
    },

    findNewPlayer(_playerId) {
        let _prefab = cc.instantiate(this.prefab_FindNewPlayer);
        if (_prefab) {
            this.node.addChild(_prefab);
            let _findNewPlayer = _prefab.getComponent('FindNewPlayerView');
            if (_findNewPlayer) {
                _findNewPlayer.setData(_playerId);
            }
        }
    },

    showDialoguePlayer(_dialogueId) {
        Game.GameController.ShowDialogue(this.node, _dialogueId);
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
