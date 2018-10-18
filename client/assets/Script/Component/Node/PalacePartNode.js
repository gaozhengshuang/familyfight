const Game = require('../../Game');

const PartsType = {
    screen: 0,                 //屏风
    lantern: 1,                 //灯笼
    window: 2,                 //栏窗
    chair: 3,                 //客椅
    carpet: 4,                 //地毯
}

cc.Class({
    extends: cc.GameComponent,

    properties: {
        button_part: { default: null, type: cc.Button },
        label_partAndLv: { default: null, type: cc.Label },
        node_price: { default: null, type: cc.Node },
        label_gold: { default: null, type: cc.Label },
        partId: { default: 0 }
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
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
        let palacePartConfig = Game.ConfigController.GetConfig("PalaceParts");
        if (palacePartConfig && palaceMapBase && this._data) {
            let palacePartBase = Game._.find(palacePartConfig, {"PartId": palaceMapBase.Parts[this.partId], "Level": this._data.partslevel[this.partId]});
            if (palacePartBase) {
                if (palacePartBase.Cost != null && palacePartBase.Cost.length > 0) {
                    this.label_partAndLv.string = palacePartBase.PartName + " Lv" + palacePartBase.Level;
                    this.label_gold.string = Game.Tools.UnitConvert(palacePartBase.Cost);
                    this.node_price.active = true;
                } else {
                    this.label_partAndLv.string = palacePartBase.PartName + " LvMax" ;
                    this.node_price.active = false;
                }
            }
        }        
    },

    onOpenDetail() {
    },
});
