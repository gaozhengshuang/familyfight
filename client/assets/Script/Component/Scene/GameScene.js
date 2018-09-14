import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        node_player: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
        label_gold: { default: null, type: cc.Label },
        prefab_Shop: { default: null, type: cc.Prefab },
        prefab_FindNewPlayer: { default: null, type: cc.Prefab },
    },

    onLoad() {
        this.initData();
        this.initNotification();
        this.initView();
    },

    start() {
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
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.AckMergePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
    },

    initData() {
        this._playerList = [];
        this._touchPlayer = null;
        this._deleteIndex = 0;

        this.mainTime = 0;
        this.synchroTime = 10;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateGold);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_PLAYER, this, this.updatePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.AckMergePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
    },

    initView() {
        this.updatePlayer();
        this.updateGold(Game.UserModel.GetGold());
    },

    updatePlayer() {
        this.node_player.removeAllChildren();
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
                _player.setParentAndData(this.node_player, playerId);
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
                        this._deleteIndex = i;
                        Game.NetWorkController.Send('msg.C2GW_ReqMergeMaid', {maidid: findPlayer.getPlayerId()});
                        break;
                    }
                }
            }
        }
    },

    AckMergePlayer(result) {
        if (result == 0) {
            //删除掉合成成功的女仆
            this._playerList[this._deleteIndex].node.destroy();
            this._playerList.splice(this._deleteIndex, 1);

            //把当前拖动的女仆进行升级
            let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", this._touchPlayer.getPlayerId());
            let nextMaidBase = Game.ConfigController.GetConfigById("TMaidLevel", maidBase.NextID);
            if (maidBase && nextMaidBase) {
                if (maidBase.Passlevels != nextMaidBase.Passlevels) {   //两个女仆的关卡等级不一样 不能同时存在
                    for (let i = 0; i < this._playerList.length; i ++) {
                        let findPlayer = this._playerList[i];
                        if (this._touchPlayer.node.uuid == findPlayer.node.uuid) {
                            findPlayer.node.destroy();
                            this._playerList.splice(i,1);
                            break;
                        }
                    }
                } else {
                    this._touchPlayer.levelUp();
                }
            }

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
