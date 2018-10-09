const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_player: { default: null, type: cc.Node },
        node_pass: { default: null, type: cc.Node },
        node_bg: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
        prefab_box: { default: null, type: cc.Prefab }
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
        this.curSynchro += dt;
        if (this.curSynchro >= this.synchroTime) {
            this.curSynchro = 0;
            Game.NetWorkController.Send('msg.C2GW_UploadTrueGold', { num: Game.UserModel.GetGold() });
        }

        this.curInterval += dt;
        if (this.curInterval >= this.intervalTime) {
            this.curInterval = 0;
            Game.UserModel.AddGold(Game.MaidModel.GetMoneyMaids());
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
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OPENBOX_ACK, this, this.ackOpenBox);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BOXDATA_UPDATE, this, this.updateBoxData);
    },

    initData() {
        this._playerList = [];
        this._boxList = [];
        this._touchPlayer = null;
        this._findPlayer = null;
        this._boxPlayer = null;
        this._deleteIndex = 0;

        this.curSynchro = 0;
        this.synchroTime = 10;  //服务器同步金币时间
        this.curInterval = 0;
        this.intervalTime = 2.0;    //刷新本地金币时间

        Game.MaidModel.SetCurPass(Game.MaidModel.GetTopPass());
        Game.MaidModel.SetCurChapter(Game.MaidModel.GetTopChapter());
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW, this, this.updateGameView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OFFLINE_ACK, this, this.offLineOpen);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OPENBOX_ACK, this, this.ackOpenBox);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BOXDATA_UPDATE, this, this.updateBoxData);
    },

    updateView() {
        let _dialoguePass = JSON.parse(cc.sys.localStorage.getItem('dialoguePass'));     //本地判断剧情初始化
        if (_dialoguePass == null || _dialoguePass.userid != Game.UserModel.GetUserId()) {
            this.showDialoguePlayer(1);
            let passData = {
                userid: Game.UserModel.GetUserId(),
                lookPass: 1,
                pass: 1,
            };
            cc.sys.localStorage.setItem('dialoguePass', JSON.stringify(passData));
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
        let boxDatas = Game.BoxModel.GetBoxsByLevel(Game.MaidModel.GetCurPass())
        for (let i = 0; i < boxDatas.length; i++) {
            let data = boxDatas[i];
            for (let j = 0; j < data.num; j++) {
                this.createBox(data.id);
            }
        }
    },

    updatePassBg() {
        let passBase = Game.ConfigController.GetConfigById("PassLevels", Game.MaidModel.GetCurPass());
        if (passBase) {
            cc.loader.loadRes(passBase.MapPrefab, function (err, prefab) {
                if (err) {
                    console.log('[严重错误] 奖励资源加载错误 ' + err);
                } else {
                    this.node_bg.destroyAllChildren();
                    let _view = cc.instantiate(prefab);
                    this.node_bg.addChild(_view);
                }
            }.bind(this));
        }
    },

    createPlayer(playerId) {
        let _posComponent = null;
        if (this._findPlayer != null && this._findPlayer.node != null) {    //如果是合成的记录找到女仆的位置
            _posComponent = this._findPlayer;
        }

        if (this._boxPlayer != null && this._boxPlayer.node != null) {    //如果是打开盒子的记录盒子的位置
            _posComponent = this._boxPlayer;
        }

        let _playerPrefab = cc.instantiate(this.prefab_player);
        if (_playerPrefab) {
            let _player = _playerPrefab.getComponent('PlayerNode');
            if (_player) {
                _player.setData(this.node_player, _posComponent, playerId);
                this._playerList.push(_player);
            }
            this.node_player.addChild(_playerPrefab);
        }
    },

    createBox(id) {
        let _boxPrefab = cc.instantiate(this.prefab_box);
        if (_boxPrefab) {
            let _box = _boxPrefab.getComponent('BoxNode');
            if (_box) {
                _box.setData(this.node_player, id, function (node) {
                    this._boxPlayer = node;
                }.bind(this));
            }
            this.node_player.addChild(_boxPrefab);
            this._boxList.push(_box);
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
                    cc.loader.loadRes(nextLvPlayer.Path, cc.SpriteFrame, function (err, spriteFrame) {
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
        }
    },

    offLineOpen() {
        if (Game.UserModel.GetOffLineReward() != null && !Game.GuideController.IsGuide()) {
            this.openView(Game.UIName.UI_OFFLINEREWARD);
        }
    },

    ackOpenBox(result) {
        if (result == 0) {
            if (this._boxPlayer) {
                this._boxPlayer.playOpenAnimation();
                Game._.remove(this._boxList, function (o) {
                    return o == this._boxPlayer;
                }.bind(this));
            }
        } else {
            if (this._boxPlayer) {
                this._boxPlayer.enableClick();
            }
        }
        this._boxPlayer = null;
    },

    updateBoxData(changeList) {
        for (let i = 0; i < changeList.length; i++) {
            let boxData = changeList[i];
            if (boxData.level == Game.MaidModel.GetCurPass()) {
                //就是这个关卡关心的宝箱数据
                if (boxData.num > 0) {
                    // 新增宝箱
                    for (let i = 0; i < boxData.num; i++) {
                        this.createBox(boxData.id);
                    }
                }
                //删除宝箱在其他地方哦 
            }
        }
    },

    findNewPlayer() {
        this.openView(Game.UIName.UI_FINDNEWPLAYER);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
    },

    showDialoguePlayer(_dialogueId) {
        Game.ViewController.showDialogue(this.node, _dialogueId);
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_SHOP);
        Game.GuideController.SendGuide(5);
    },

    onOpenTurnBrand(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_TURNBRAND);
    },

    onOpenPalace(event) {
        event.stopPropagationImmediate();
        Game.PalaceModel.SetCurPalaceId(1);
        this.openView(Game.UIName.UI_PALACEDETAIL);
    },

    //interfaces for guide
    //获得相应数量的某种女仆
    getMaidById: function (id, count) {
        let ret = [];
        for (let i = 0; i < this._playerList.length; i++) {
            let _player = this._playerList[i];
            if (Game._.get(_player, 'id', -1) == id) {
                ret.push(_player);
                if (ret.length >= count) {
                    break;
                }
            }
        }
        return ret;
    },

    //获得相应数量的轿子
    getBox: function (count) {
        return Game._.slice(this._boxList, 0, count);
    }
});
