const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_master: { default: null, type: cc.Sprite },
        button_master: { default: null, type: cc.Button },
        label_palaceName: { default: null, type: cc.Label },
        label_masterName: { default: null, type: cc.Label },
        label_unlockTxt: { default: null, type: cc.Label },
        node_charmBg: { default: null, type: cc.Node },
        label_charmnum: { default: null, type: cc.Label },
        node_loveBg: { default: null, type: cc.Node },
        label_lovenum: { default: null, type: cc.Label },
    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateCharmOrLove);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateCharmOrLove);
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];
        
        this.button_master.interactable = Game.MaidModel.GetTopPass() >= this._data.UlockPassId && Game.MaidModel.GetMaids().length > 0;
        Game.ResController.SetSprite(this.image_master, this._data.Headpath);
        this.label_palaceName.string = this._data.Name;
        
        this._palaceData = Game.PalaceModel.GetPalaceDataById(this._data.Id);
        if (this._palaceData) {
            this._masterLvUpBase = Game.PalaceModel.GetPalaceMasterLvUpBase(this._data.Master, this._palaceData.level);
            if (this._masterLvUpBase) {
                this.label_masterName.string = Game.MaidModel.GetPersonNameById(this._data.Master) + '(' + this._masterLvUpBase.levelName + ')';
            }
            this.label_charmnum.string = this._palaceData.charm;
        } else {
            this.label_masterName.string = Game.MaidModel.GetPersonNameById(this._data.Master) + "(娴贵人)";
        }

        if (Game.MaidModel.GetTopPass() >= this._data.UlockPassId) {
            this.label_palaceName.node.color = cc.color(88, 34, 10);
            this.label_masterName.node.color = cc.color(88, 34, 10);

            this.label_unlockTxt.string = '';
            this.node_charmBg.active = true;
        } else {
            this.label_palaceName.node.color = cc.color(120, 120, 120);
            this.label_masterName.node.color = cc.color(120, 120, 120);

            let passBase = Game.ConfigController.GetConfigById("PassLevels", this._data.UlockPassId);
            if (passBase) {
                this.label_unlockTxt.string = `第${passBase.ChapterID}章第${passBase.Index}关解锁`;
            }
            this.node_charmBg.active = false;
        }
    },

    clicked() {
        if (Game.MaidModel.GetTopPass() >= this._data.UlockPassId && Game.MaidModel.GetMaids().length > 0) {
            Game.PalaceModel.SetCurPalaceId(this._data.Id);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.PALACEDATA_ACK);
            Game.ViewController.openView(Game.UIName.UI_PALACEDETAIL);
            Game.GuideController.NextGuide();
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "宫殿尚未解锁");
        }
    },

    updateCharmOrLove() {
        this._palaceData = Game.PalaceModel.GetPalaceDataById(this._data.Id);
        if (this._palaceData) {
            this.label_charmnum.string = this._palaceData.charm;
        }
    }
});
