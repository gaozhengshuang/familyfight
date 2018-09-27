const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_player: { default: null, type: cc.Node },
        node_pass: { default: null, type: cc.Node },
        node_bg: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
    },

    onLoad() {
        this.initData();
        this.initNotification();
    },

    start() {
        this.updateView();
        this.offLineOpen();
    },

    update(dt) {
        this.mainTime += dt;
        if (this.mainTime >= this.synchroTime) {
            this.mainTime = 0;
            Game.NetWorkController.Send('msg.C2GW_UploadTrueGold', { num: Game.UserModel.GetGold() });
        }
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW, this, this.updateGameView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OFFLINE_ACK, this, this.offLineOpen);
    },

    initData() {
        this._playerList = [];
        this._touchPlayer = null;
        this._findPlayer = null;
        this._deleteIndex = 0;

        this.mainTime = 0;
        this.synchroTime = 10;

        Game.MaidModel.SetCurPass(Game.MaidModel.GetTopPass());
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW, this, this.updateGameView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OFFLINE_ACK, this, this.offLineOpen);
    },

    updateView() {
        let _lookTopPass = cc.sys.localStorage.getItem('lookTopPass');
        if (_lookTopPass == 0 || _lookTopPass == null) {
            this.showDialoguePlayer(1);
            cc.sys.localStorage.setItem('lookTopPass', 1);
        }

        this.updateGameView();
    },

    updateGameView() {
        this.updatePlayer();
        this.updatePassBg();
    },

    updatePlayer() {
        this._playerList = [];
        this.node_player.destroyAllChildren();
        for (let i = 0; i < Game.MaidModel.GetMaids().length; i++) {
            let player = Game.MaidModel.GetMaids()[i];
            let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", player.id);
            if (maidBase && maidBase.Passlevels == Game.MaidModel.GetCurPass()) {
                for (let b = 0; b < player.count; b++) {
                    this.createPlayer(player.id);
                }
            }
        }
    },

    updatePassBg() {
        let passBase = Game.ConfigController.GetConfigById("PassLevels", Game.MaidModel.GetCurPass());
        if (passBase) {
            this.node_bg.destroyAllChildren();
            cc.loader.loadRes(passBase.MapPrefab, function (err, prefab) {
                if (err) {
                    console.log('[严重错误] 奖励资源加载错误 ' + err);
                } else {
                    let _view = cc.instantiate(prefab);
                    this.node_bg.addChild(_view);
                }
            }.bind(this));
        }
    },

    createPlayer(playerId) {
        let _playerPrefab = cc.instantiate(this.prefab_player);
        if (_playerPrefab) {
            let _player = _playerPrefab.getComponent('PlayerNode');
            if (_player) {
                _player.setData(this.node_player, this._findPlayer, playerId);
                this._playerList.push(_player);
            }
            this.node_player.addChild(_playerPrefab);
        }
    },

    findPlayerAndMerge(_player) {
        this._touchPlayer = _player;

        for (let i = 0; i < this._playerList.length; i++) {
            let findPlayer = this._playerList[i];

            if (this._touchPlayer.node.uuid != findPlayer.node.uuid) {
                if (this._touchPlayer.node.getBoundingBox().intersects(findPlayer.node.getBoundingBox())) {
                    if (this._touchPlayer.getPlayerId() == findPlayer.getPlayerId()) {
                        this._findPlayer = findPlayer;
                        Game.NetWorkController.Send('msg.C2GW_ReqMergeMaid', { maidid: findPlayer.getPlayerId() });
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

            //升级后的女仆没在此关卡后的动画
            let nextLvPlayer = Game.ConfigController.GetConfigById("TMaidLevel", this._findPlayer.getMaidBase().NextID);
            if (nextLvPlayer) {
                if (nextLvPlayer.Passlevels != this._findPlayer.getMaidBase().Passlevels) {
                    let curX = this._findPlayer.node.x;
                    let curY = this._findPlayer.node.y;
                    cc.loader.loadRes(this._findPlayer.getMaidBase().Path, cc.SpriteFrame, function (err, spriteFrame) {
                        var node_newMaid = new cc.Node('newMaid');
                        const sprite = node_newMaid.addComponent(cc.Sprite);
                        sprite.spriteFrame = spriteFrame;
                        this.node_player.addChild(node_newMaid);

                        node_newMaid.x = curX;
                        node_newMaid.y = curY;

                        node_newMaid.runAction(cc.sequence([
                            cc.spawn([
                                cc.moveTo(0.6, 0, 400),
                                cc.scaleTo(0.6, 0, 0),
                            ]),
                            cc.callFunc(function () {
                                node_newMaid.destroy();
                                node_newMaid = null;
                            }, this)
                        ]));
                    }.bind(this));
                }
            }

            this._touchPlayer.node.destroy();
            this._findPlayer.node.destroy();

            Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
        }
    },

    offLineOpen() {
        if (Game.UserModel.GetOffLineReward() != null) {
            this.openView(Game.UIName.UI_OFFLINEREWARD);
        }
    },

    findNewPlayer() {
        this.openView(Game.UIName.UI_FINDNEWPLAYER);
    },

    showDialoguePlayer(_dialogueId) {
        Game.GameController.ShowDialogue(this.node, _dialogueId);
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_SHOP);
    },
    
    onOpenTurnBrand(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_TURNBRAND);
    },

    onOpenPalace(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_PALACE);
    }
});
