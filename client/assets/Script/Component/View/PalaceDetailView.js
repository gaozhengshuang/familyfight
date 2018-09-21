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
                this.label_getTime.string ='生产中\n' + Game.moment.unix(this.leftTime).format('mm:ss');
            }
        }
    },

    initData() {
        this._data = null;

        this.mainTime = 0;
        this.synchroTime = 1;
        this.leftTime = 0;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEDATA_ACK, this, this.updateView);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
        if (palaceMapBase) {
            Game.ResController.SetSprite(this.image_master, palaceMapBase.Headpath);
            Game.ResController.SetSprite(this.image_palaceCard, palaceMapBase.BannerPath);
            this.label_master.string = Game.MaidModel.GetMaidNameById(palaceMapBase.Master);

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
                    _maidPrefab.x = pos[0];
                    _maidPrefab.y = pos[1];
                    this.node_maid.addChild(_maidPrefab);
                }
            }
        }

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
