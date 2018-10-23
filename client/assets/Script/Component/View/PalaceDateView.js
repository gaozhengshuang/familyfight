const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_head: { default: null, type: cc.Sprite },
        image_event1: { default: null, type: cc.Sprite },
        image_event2: { default: null, type: cc.Sprite },
        image_event3: { default: null, type: cc.Sprite },
        label_event1: { default: null, type: cc.Label },
        label_event2: { default: null, type: cc.Label },
        label_event3: { default: null, type: cc.Label },
        label_select: { default: null, type: cc.Label },
        label_name: { default: null, type: cc.Label },
        label_content: { default: null, type: cc.RichText },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckTryst', this, this.onGW2C_AckTryst);
    },

    initData() {
        this._data = null;
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.GW2C_AckTryst', this, this.onGW2C_AckTryst);
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        if (this._data) {
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
            if (palaceMapBase) {
                let maidBase = Game.ConfigController.GetConfigById("PalacePersonnel", palaceMapBase.Master);
                if (maidBase) {
                    this.label_name.string = dialogueBase.Name;
                    Game.ResController.SetSprite(this.image_head, dialogueBase.Headpath);
                }
            }
        }
    },

    onGW2C_AckTryst(msgid, data) {
        if (data.result == 0) {
            this.updateView();
        } else {
            this.showTips("约会失败...");
        }
    },

    onSeleceX(event,data) {
        console.log(data);
        
        // Game.NetWorkController.Send('msg.C2GW_ReqLuckily', {
        //     palaceid: Game.PalaceModel.GetCurPalaceId(),
        // });
    },
});
