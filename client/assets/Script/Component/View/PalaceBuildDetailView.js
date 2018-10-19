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
            this.palacePartBase = Game._.find(palacePartConfig, {"PartId": palaceMapBase.Parts[this.partId], "Level": palaceData.partslevel[this.partId]});
            if (this.palacePartBase) {
                Game.ResController.SetSprite(this.image_furniture, this.palacePartBase.PartPath);
                this.label_title.string = this.palacePartBase.PartName + "详情";
                this.label_frunitureDetail.string = this.palacePartBase.PartName + "Lv" + this.palacePartBase.Level;
                if (this.palacePartBase.Cost != null && this.palacePartBase.Cost.length > 0) {
                    this.label_goldnum.string = "x" + Game.Tools.UnitConvert(this.palacePartBase.Cost);
                    this.button_levelup.interactable = Game.CurrencyModel.CompareGold(this.palacePartBase.Cost) >= 0;
                    this.button_levelup.node.active = true;
                } else {
                    this.button_levelup.node.active = false;
                }
            }
        }        
    },

    onLvUp() {
        if (Game.CurrencyModel.CompareGold(this.palacePartBase.Cost) >= 0) {
            Game.NetWorkController.Send('msg.C2GW_ReqPartLevelup',
            {
                id: Game.PalaceModel.GetCurPalaceId(),
                index: this.partId,
            });

            Game.CurrencyModel.SubtractGold(this.palacePartBase.Cost);
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "金币不足哟!");
        }
    },
});
