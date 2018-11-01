const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_player: { default: null, type: cc.Node },
        node_bg: { default: null, type: cc.Node },
        prefab_player: { default: null, type: cc.Prefab },
        prefab_box: { default: null, type: cc.Prefab },

        button_shop: { default: null, type: cc.Button },
        button_turnbrand: { default: null, type: cc.Button },
        button_palace: { default: null, type: cc.Button },

        label_allincomenum: { default: null, type: cc.Label },
        label_curEfficiency: { default: null, type: cc.Label },
        label_maxEfficiency: { default: null, type: cc.Label },
        label_curMaidNum: { default: null, type: cc.Label },
        label_maxMaidNum: { default: null, type: cc.Label },

        label_shopUnlock: { default: null, type: cc.Label },
        label_turnbrandUnlock: { default: null, type: cc.Label },
        label_palaceUnlock: { default: null, type: cc.Label },
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
            Game.NetWorkController.Send('msg.C2GW_UploadBigGold', { golds: Game.CurrencyModel.GetGold() });
        }

        this.curInterval += dt;
        if (this.curInterval >= this.intervalTime) {
            this.curInterval = 0;

            let curPassMoney = Game.Tools.toBigIntMoney(Game.MaidModel.GetMoneyMaids());
            if (this._palceData != null) {
                if (this._palceData.luckily != 0) {
                    curPassMoney = curMoney.multiply(100 + this._palceData.luckily).divide(100);
                }
            }
            Game.CurrencyModel.AddGold(Game.Tools.toLocalMoney(curPassMoney.multiply(Game.bigInteger(this.intervalTime))));
        }
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW, this, this.updateGameView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.UPDATE_PLAYER, this, this.updateEfficiency);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OFFLINE_ACK, this, this.offLineOpen);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.OPENBOX_ACK, this, this.ackOpenBox);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.BOXDATA_UPDATE, this, this.updateBoxData);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
    },

    initData() {
        this._playerList = [];
        this._boxList = [];
        this._findPlayer = null;
        this._boxPlayer = null;
        this._deleteIndex = 0;

        this.curSynchro = 0;
        this.synchroTime = 10;  //服务器同步金币时间
        this.curInterval = 0;
        this.intervalTime = 2.0;    //刷新本地金币时间
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGE_PLAYER, this, this.findPlayerAndMerge);
        Game.NotificationController.On(Game.Define.EVENT_KEY.ADD_PLAYER, this, this.createPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW, this, this.updateGameView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.MERGEPLAYER_ACK, this, this.ackMergePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.UPDATE_PLAYER, this, this.updateEfficiency);
        Game.NotificationController.On(Game.Define.EVENT_KEY.FINDNEW_PLAYER, this, this.findNewPlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this, this.showDialoguePlayer);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OFFLINE_ACK, this, this.offLineOpen);
        Game.NotificationController.On(Game.Define.EVENT_KEY.OPENBOX_ACK, this, this.ackOpenBox);
        Game.NotificationController.On(Game.Define.EVENT_KEY.BOXDATA_UPDATE, this, this.updateBoxData);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
    },

    updateView() {
        this.updateGameView();
        this.updateBottomButton();
    },

    updateGameView() {
        this.updatePlayer();
        this.updatePassBg();
        this.updateEfficiency();
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
        this._palceData = Game.PalaceModel.GetPalaceDataById(Game.MaidModel.GetCurChapter());    //当前关卡信息

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

    updateBottomButton() {
        let shopLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.SHOP);
        this.button_shop.interactable = shopLock;
        this.label_shopUnlock.node.active = !shopLock;

        let turnbrandLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.TURNBRAND);
        this.button_turnbrand.interactable = turnbrandLock;
        this.label_turnbrandUnlock.node.active = !turnbrandLock;

        let palaceLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.PALACE);
        this.button_palace.interactable = palaceLock;
        this.label_palaceUnlock.node.active = !palaceLock;
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
        for (let i = 0; i < this._playerList.length; i++) {
            let findPlayer = this._playerList[i];

            if (_player.node.uuid != findPlayer.node.uuid) {
                if (_player.node.getBoundingBox().intersects(findPlayer.node.getBoundingBox())) {
                    if (_player.getPlayerId() == findPlayer.getPlayerId()) {
                        this._findPlayer = findPlayer;
                        Game.NetWorkController.Send('msg.C2GW_ReqMergeMaid', {
                            maidid: findPlayer.getPlayerId(),
                            touchid: _player.node.uuid,
                            findid: findPlayer.node.uuid
                        });
                        break;
                    }
                }
            }
        }
    },

    ackMergePlayer(data) {
        if (data.result == 0) {
            //升级后的女仆没在此关卡后的动画
            let nextLvPlayer = Game.ConfigController.GetConfigById("TMaidLevel", this._findPlayer.getMaidBase().NextID);
            if (nextLvPlayer) {
                if (nextLvPlayer.Passlevels != this._findPlayer.getMaidBase().Passlevels) {
                    let curX = this._findPlayer.node.x;
                    let curY = this._findPlayer.node.y;

                    let passBase = Game.ConfigController.GetConfigById("PassLevels", nextLvPlayer.Passlevels);
                    if (passBase) {
                        let passCellNode = null;
                        if (passBase.Index == 1) {
                            passCellNode = Game.ViewController.seekChildByName(this.node, "button_jiantouright");
                        } else {
                            passCellNode = Game.ViewController.seekChildByName(this.node, "cell_" + passBase.Index);
                        }

                        let oldWorldPosition = passCellNode.parent.convertToWorldSpaceAR(passCellNode.position);
                        let newWordPosition = this.node_player.convertToNodeSpaceAR(oldWorldPosition);

                        cc.loader.loadRes(nextLvPlayer.Path, cc.SpriteFrame, function (err, spriteFrame) {
                            var node_newMaid = new cc.Node('newMaid');
                            const sprite = node_newMaid.addComponent(cc.Sprite);
                            sprite.spriteFrame = spriteFrame;
                            this.node_player.addChild(node_newMaid);

                            node_newMaid.x = curX;
                            node_newMaid.y = curY;

                            node_newMaid.runAction(cc.sequence([
                                cc.spawn([
                                    cc.moveTo(0.8, newWordPosition.x, newWordPosition.y),
                                    cc.scaleTo(0.8, 0.2, 0.2),
                                ]),
                                cc.callFunc(function () {
                                    node_newMaid.destroy();
                                    node_newMaid = null;
                                }, this)
                            ]));
                        }.bind(this));
                    }
                }
            }

            //删除掉合成成功的女仆
            let i = this._playerList.length;
            while (i--) {
                if (this._playerList[i].node.uuid == data.touchid || this._playerList[i].node.uuid == data.findid) {
                    this._playerList[i].node.destroy();
                    this._playerList.splice(i, 1);
                }
            }

            this.updateEfficiency();
        }
    },

    offLineOpen() {
        if (Game.CurrencyModel.offLineReward != null) {
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

    findNewPlayer(oldid, newid) {
        //看看有没有解锁新章节
        this._showChapter(oldid, newid);
        this.updateBottomButton();
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
    },

    showDialoguePlayer(_dialogueId) {
        if (!Game.GuideController.IsGuide()) {
            Game.ViewController.showDialogue(this.node, _dialogueId);
        }
    },

    onOpenShopView(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_SHOP);
        Game.GuideController.NextGuide();
    },

    onOpenTurnBrand(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_TURNBRAND);
        Game.GuideController.NextGuide();
    },

    onOpenPalace(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_PALACE);
        Game.GuideController.NextGuide();
    },

    updateEfficiency() {     //更新效率和仆人个数
        let luckily = 0;
        if (this._palceData != null) {
            luckily = this._palceData.luckily;
        }

        let allLuckily = 0;
        for (let i = 0; i < Game.PalaceModel.palaceDatas.length; i++) {
            allLuckily += Game.PalaceModel.palaceDatas[i].luckily;
        }
        let allincomenum = Game.Tools.toBigIntMoney(Game.MaidModel.GetMoneyMaids());
        allincomenum = allincomenum.multiply(100 + allLuckily);  //加成效率
        this.label_allincomenum.string = Game.Tools.UnitConvert(Game.Tools.toLocalMoney(allincomenum.multiply(36)));

        let curEfficiency = Game.Tools.toBigIntMoney(Game.MaidModel.GetPassCurEfficiency(Game.MaidModel.GetCurPass()));
        curEfficiency = curEfficiency.multiply(100 + luckily);  //加成效率
        this.label_curEfficiency.string = Game.Tools.UnitConvert(Game.Tools.toLocalMoney(curEfficiency.multiply(36)));

        let maxEfficiency = Game.Tools.toBigIntMoney(Game.MaidModel.GetPassMaxEfficiency(Game.MaidModel.GetCurPass()));
        maxEfficiency = maxEfficiency.multiply(100 + luckily);  //加成效率
        this.label_maxEfficiency.string = "/" + Game.Tools.UnitConvert(Game.Tools.toLocalMoney(maxEfficiency.multiply(36)));

        this.label_curMaidNum.string = `${this._playerList.length}`;
        this.label_maxMaidNum.string = '/20';
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
        let ret = Game._.slice(this._boxList, 0, count);
        return ret;
    },
    _showChapter: function (oldid, newid) {
        let newLevel = Game.MaidModel.GetLevelBaseByMaid(newid);
        let oldLevel = Game.MaidModel.GetLevelBaseByMaid(oldid);
        if (newLevel != null && oldLevel != null && newLevel.ChapterID != oldLevel.ChapterID) {
            //新章节了
            this.openView(Game.UIName.UI_NEWCHAPTERVIEW, {
                levelid: newLevel.Id,
                closefunc: this._showLevel.bind(this, oldid, newid)
            });
        } else {
            this._showLevel(oldid, newid);
        }
    },
    _showLevel: function (oldid, newid) {
        let newLevel = Game.MaidModel.GetLevelBaseByMaid(newid);
        let oldLevel = Game.MaidModel.GetLevelBaseByMaid(oldid);
        if (newLevel != null && oldLevel != null && newLevel.Id != oldLevel.Id) {
            //新关卡了
            this.openView(Game.UIName.UI_NEWLEVELVIEW, {
                levelid: newLevel.Id,
                closefunc: this._showMaid.bind(this, oldid, newid)
            });
        } else {
            this._showMaid(oldid, newid);
        }
    },
    _showMaid: function (oldid, newid) {
        this.openView(Game.UIName.UI_FINDNEWPLAYER);
    }
});
