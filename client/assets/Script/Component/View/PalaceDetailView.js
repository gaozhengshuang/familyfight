const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_maid: { default: null, type: cc.Node },
        image_master: { default: null, type: cc.Sprite },
        label_master: { default: null, type: cc.Label },
        label_tltie: { default: null, type: cc.Label },
        image_palaceCard: { default: null, type: cc.Sprite },
        image_get: { default: null, type: cc.Sprite },
        label_get: { default: null, type: cc.Label },
        label_getnum: { default: null, type: cc.Label },
        label_getTime: { default: null, type: cc.Label },
        image_lvUp: { default: null, type: cc.Sprite },
        label_needLvItem: { default: null, type: cc.Label },
        prefab_maid: { default: null, type: cc.Prefab },

        button_bestowed: { default: null, type: cc.Button },
        button_build: { default: null, type: cc.Button },
        button_sleep: { default: null, type: cc.Button },
        label_bestowedUnlock: { default: null, type: cc.Label },
        label_buildUnlock: { default: null, type: cc.Label },
        label_sleepUnlock: { default: null, type: cc.Label },
        label_maidPercentage: { default: null, type: cc.Label },

        label_curEfficiency: { default: null, type: cc.Label },
        label_maxEfficiency: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
        this.updateBottomButton();
        this.updateCharmOrLove();
    },

    onDisable() {
        this.removeNotification();
    },

    onClose() {
        this.closeView(this._url);
        Game.GuideController.NextGuide();
    },

    update(dt) {
        this.mainTime += dt;
        if (this.mainTime >= this.synchroTime) {
            this.mainTime = 0;
            if (this.leftTime > 0) {
                this.leftTime = this.leftTime - 1;
                if (this.leftTime > 0) {
                    this.label_getTime.string = '生产中\n' + Game.moment.unix(this.leftTime).format('mm:ss');
                } else {
                    this.getItemBtnStateView();
                }
            }
        }
    },

    initData() {
        this._data = null;
        this._palaceMaids = [];

        this.mainTime = 0;
        this.synchroTime = 1;
        this.leftTime = 0;

        this.masterId = 0;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACEMAID_UNLOCK, this, this.updatePalaceMaids);
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACETASK_ACK, this, this.updateGetState);
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACEMASTERLVUP_ACK, this, this.updateLvUpBtnState);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
        Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateCharmOrLove);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEMAID_UNLOCK, this, this.updatePalaceMaids);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACETASK_ACK, this, this.updateGetState);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEMASTERLVUP_ACK, this, this.updateLvUpBtnState);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateCharmOrLove);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
        if (palaceMapBase) {
            this.masterId = palaceMapBase.Master;
            Game.ResController.SetSprite(this.image_master, palaceMapBase.Headpath);
            Game.ResController.SetSprite(this.image_palaceCard, palaceMapBase.BannerPath);
            this.label_master.string = Game.MaidModel.GetPersonNameById(palaceMapBase.Master);

            this._palaceMaids = [];     //创建宫殿里的女仆形象
            this.node_maid.destroyAllChildren();
            for (let i = 0; i < palaceMapBase.Maids.length; i++) {
                let maidId = palaceMapBase.Maids[i];
                let _maidPrefab = cc.instantiate(this.prefab_maid);
                if (_maidPrefab) {
                    _maidPrefab.name = `PalaceMaidNode${i+1}`;
                    
                    let _maid = _maidPrefab.getComponent('PalaceMaidNode');
                    if (_maid) {
                        _maid.setData(maidId, i);
                    }
                    let pos = palaceMapBase.MaidsXY[i].split(",");
                    _maidPrefab.x = Number(pos[0]);
                    _maidPrefab.y = Number(pos[1]);
                    this.node_maid.addChild(_maidPrefab);
                    this._palaceMaids.push(_maid);
                }
            }
        }

        this.getItemBtnStateView();
        this.lvUpBtnStateView();
    },

    updatePalaceMaids() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());

        Game._.forEach(this._palaceMaids, function (v) {
            v.updateView();
        });
        this.updateEfficiency();
    },

    updateGetState() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());

        this.getItemBtnStateView();
        this.lvUpBtnStateView();
        this.openView(Game.UIName.UI_PALACETASKITEM);
    },

    updateLvUpBtnState() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());

        this.lvUpBtnStateView();
        Game._.forEach(this._palaceMaids, function (v) {
            v.updateView();
        });
    },

    getItemBtnStateView() {
        if (Game.TimeController.GetCurTime() >= this._data.endtime) {
            this.label_get.node.active = true;
            this.label_getnum.node.active = true;
            this.label_getTime.node.active = false;
            this.label_getnum.string = `+${Game.Tools.UnitConvert(this._data.golds)}`;
            Game.ResController.SetSprite(this.image_get, "Image/GameScene/Common/button_get");
        } else {
            this.label_get.node.active = false;
            this.label_getnum.node.active = false;
            this.label_getTime.node.active = true;
            this.leftTime = this._data.endtime - Game.TimeController.GetCurTime();
            this.label_getTime.string = '生产中\n' + Game.moment.unix(this.leftTime).format('mm:ss');
            Game.ResController.SetSprite(this.image_get, "Image/GameScene/Common/button_building");
        }
    },

    lvUpBtnStateView() {
        let masterLvUpBase = Game.PalaceModel.GetPalaceMasterLvUpBase(this.masterId, this._data.level);  //主人升级相关
        if (masterLvUpBase) {
            let lvItemBase = masterLvUpBase.LevelupCost[0];
            if (lvItemBase) {
                let item_num = lvItemBase.split("_");
                if (item_num) {
                    if (Game.ItemModel.GetItemNumById(item_num[0]) >= item_num[1]) {
                        Game.ResController.SetSprite(this.image_lvUp, "Image/GameScene/Common/image_LvUp");
                    } else {
                        Game.ResController.SetSprite(this.image_lvUp, "Image/GameScene/Common/image_noLvUp");
                    }
                    this.label_needLvItem.string = Game.ItemModel.GetItemNumById(item_num[0]) + "/" + item_num[1];
                }
                this.image_lvUp.node.active = true;
            } else {
                this.label_needLvItem.string = "";
                this.image_lvUp.node.active = false;
            }
            this.label_tltie.string = '(' + masterLvUpBase.levelName + ')';
        }
    },

    updateBottomButton() {
        let bestowedLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.BESTOWED);
        this.button_bestowed.interactable = bestowedLock;
        this.label_bestowedUnlock.node.active = !bestowedLock;

        let buildLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.BUILD);
        this.button_build.interactable = buildLock;
        this.label_buildUnlock.node.active = !buildLock;

        let sleepLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.SLEEP);
        this.button_sleep.interactable = sleepLock;
        this.label_sleepUnlock.node.active = !sleepLock;
    },

    updateCharmOrLove() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        this.label_maidPercentage.string = `${this._data.charm}%`;

        this.getItemBtnStateView();
        this.updateEfficiency();
    },

    updateEfficiency() {
        let curEfficiency = Game.Tools.toBigIntMoney(["0_0"]);
        let maxEfficiency = Game.Tools.toBigIntMoney(["0_0"]);
        
        Game._.forEach(this._palaceMaids, function (v) {
            if (this._data.maids[v.getIndex()]) {
                curEfficiency = curEfficiency.add(Game.Tools.toBigIntMoney(v.getMaidBase().GoldAddition));
            }
            maxEfficiency = maxEfficiency.add(Game.Tools.toBigIntMoney(v.getMaidBase().GoldAddition));
        }.bind(this));

        curEfficiency = curEfficiency.multiply(100 + this._data.charm);  //加成效率
        maxEfficiency = maxEfficiency.multiply(100 + this._data.charm);  //加成效率

        this.label_curEfficiency.string = Game.Tools.UnitConvert(Game.Tools.toLocalMoney(curEfficiency.multiply(36)));
        this.label_maxEfficiency.string = "/" + Game.Tools.UnitConvert(Game.Tools.toLocalMoney(maxEfficiency.multiply(36)));
    },

    onOpenLvUp(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_PALACEMASTERLVUP);
        Game.GuideController.NextGuide();
    },

    onOpenTravel(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_TRAVELVIEW);
        Game.GuideController.NextGuide();
    },

    onOpenEvent(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_EVENTVIEW);
        Game.GuideController.NextGuide();
    },

    onOpenSleep(event) {
        event.stopPropagationImmediate();
        Game.GuideController.NextGuide();
    },

    onOpenBuild(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_PALACEBUILD);
        Game.GuideController.NextGuide();
    },

    onReqPalaceTakeBack() {
        let isUnlockMaid = false;
        for (let i = 0; i < this._data.maids.length; i ++) {
            let maidInfo = this._data.maids[i];
            if (maidInfo) {
                isUnlockMaid = true;
                break;
            }
        }
        if (isUnlockMaid) {
            Game.NetWorkController.Send('msg.C2GW_ReqPalaceTakeBack',
            {
                id: Game.PalaceModel.GetCurPalaceId(),
            });
            Game.GuideController.NextGuide();
        } else {
            this.showTips("请先解锁宫女!");
        }
    }
});
