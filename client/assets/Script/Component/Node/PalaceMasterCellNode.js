const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_master: { default: null, type: cc.Sprite },
        button_master: { default: null, type: cc.Button },
        label_palaceName: { default: null, type: cc.Label },
        label_masterName: { default: null, type: cc.Label },
        label_unlockTxt: { default: null, type: cc.Label },
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
                this.label_masterName.string = Game.MaidModel.GetMaidNameById(this._data.Master) + '(' + this._masterLvUpBase.levelName + ')';
            }
        } else {
            this.label_masterName.string = Game.MaidModel.GetMaidNameById(this._data.Master) + "(娴贵人)";
        }

        if (Game.MaidModel.GetTopPass() >= this._data.UlockPassId) {
            this.label_palaceName.node.color = cc.color(88, 34, 10);
            this.label_masterName.node.color = cc.color(88, 34, 10);

            this.label_unlockTxt.string = '';
        } else {
            this.label_palaceName.node.color = cc.color(120, 120, 120);
            this.label_masterName.node.color = cc.color(120, 120, 120);

            this.label_unlockTxt.string = `第${this._data.UlockPassId}关解锁`
        }
    },

    clicked() {
        if (Game.MaidModel.GetTopPass() >= this._data.UlockPassId && Game.MaidModel.GetMaids().length > 0) {
            Game.PalaceModel.SetCurPalaceId(this._data.Id);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.PALACEDATA_ACK);
            Game.ViewController.openView(Game.UIName.UI_PALACEDETAIL);
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "宫殿尚未解锁");
        }
    }
});
