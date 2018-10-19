const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_title: { default: null, type: cc.Label },
        image_furniture: { default: null, type: cc.Sprite },
        label_frunitureDetail: { default: null, type: cc.Label },
        button_levelup: { default: null, type: cc.Button },
        label_goldnum: { default: null, type: cc.Label },
        label_charmNum: { default: null, type: cc.Label },
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    updateView() {
        this.partId = this._data;

        let palaceData = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", palaceData.id);
        let palacePartConfig = Game.ConfigController.GetConfig("PalaceParts");
        if (palacePartConfig && palaceMapBase && palaceData) {
            let palacePartBase = Game._.find(palacePartConfig, {"PartId": palaceMapBase.Parts[this.partId], "Level": palaceData.partslevel[this.partId]});
            if (palacePartBase) {
                Game.ResController.SetSprite(this.image_furniture, palacePartBase.PartPath);
                this.label_title.string = palacePartBase.PartName + "详情";
                this.label_frunitureDetail.string = palacePartBase.PartName + "Lv" + palacePartBase.Level;
                if (palacePartBase.Cost != null && palacePartBase.Cost.length > 0) {
                    this.label_goldnum.string = "x" + Game.Tools.UnitConvert(palacePartBase.Cost);
                    this.button_levelup.node.active = true;
                } else {
                    this.button_levelup.node.active = false;
                }
            }
        }        
    },

    onLvUp() {
        Game.NetWorkController.Send('msg.C2GW_ReqPartLevelup',
        {
            id: Game.PalaceModel.GetCurPalaceId(),
            index: this.partId,
        });
    },
});
