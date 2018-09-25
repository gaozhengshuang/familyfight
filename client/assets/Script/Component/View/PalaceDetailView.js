const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        node_maid: { default: null, type: cc.Node },
        image_master: { default: null, type: cc.Sprite },
        label_master: { default: null, type: cc.Label },
        image_palaceCard: { default: null, type: cc.Sprite },
        image_get: { default: null, type: cc.Sprite },
        label_get: { default: null, type: cc.Label },
        label_getTime: { default: null, type: cc.Label },
        image_lvUp: { default: null, type: cc.Sprite },
        label_needLvItem: { default: null, type: cc.Label },
        prefab_maid: { default: null, type: cc.Prefab },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    update(dt) {
        this.mainTime += dt;
        if (this.mainTime >= this.synchroTime) {
            this.mainTime = 0;
            if (this.leftTime > 0) {
                this.leftTime = this.leftTime - 1;
                if (this.leftTime > 0) {
                    this.label_getTime.string ='生产中\n' + Game.moment.unix(this.leftTime).format('mm:ss');
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
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEMAID_UNLOCK, this, this.updatePalaceMaids);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACETASK_ACK, this, this.updateGetState);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEMASTERLVUP_ACK, this, this.updateLvUpBtnState);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
        if (palaceMapBase) {
            this.masterId = palaceMapBase.Master;
            Game.ResController.SetSprite(this.image_master, palaceMapBase.Headpath);
            Game.ResController.SetSprite(this.image_palaceCard, palaceMapBase.BannerPath);
            this.label_master.string = Game.MaidModel.GetMaidNameById(palaceMapBase.Master);

            this._palaceMaids = [];     //创建宫殿里的女仆形象
            this.node_maid.destroyAllChildren();
            for (let i = 0; i < palaceMapBase.Maids.length; i ++) {
                let maidId = palaceMapBase.Maids[i];
                let _maidPrefab = cc.instantiate(this.prefab_maid);
                if (_maidPrefab) {
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
        
        Game._.forEach(this._palaceMaids, function(v) {
            v.updateView();
        });
    },

    updateGetState() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());

        this.getItemBtnStateView();
        Game.UserModel.AddGold(Game.PalaceModel.GetPalaceTakeBack().gold);

        this.openView(Game.UIName.UI_PALACETASKITEM);
    },

    updateLvUpBtnState() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());

        this.lvUpBtnStateView();
    },

    getItemBtnStateView() {
        if (Game.TimeController.GetCurTime() >= this._data.endtime) {
            this.label_get.node.active = true;
            this.label_getTime.node.active = false;
            Game.ResController.SetSprite(this.image_get, "Image/GameScene/Common/button_common");
        } else {
            this.label_get.node.active = false;
            this.label_getTime.node.active = true;
            this.leftTime = this._data.endtime - Game.TimeController.GetCurTime();
            this.label_getTime.string = '生产中\n' +Game.moment.unix(this.leftTime).format('mm:ss');
            Game.ResController.SetSprite(this.image_get, "Image/GameScene/Common/button_common2");
        }
    },

    lvUpBtnStateView(){
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
            }
        }
    },

    onOpenLvUp(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_PALACEMASTERLVUP);
    },

    onReqPalaceTakeBack() {
        Game.NetWorkController.Send('msg.C2GW_ReqPalaceTakeBack', 
        {
            id: Game.PalaceModel.GetCurPalaceId(),
        });
    }
});
