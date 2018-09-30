const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_palace: { default: null, type: cc.Sprite },
        image_head: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },
    },

    onLoad() {
    },

    start() {
        this.updateView()
    },

    update(dt) {
    },

    onDestroy() {
    },
    
    setData(data) {
        this._data = data;
    },

    updateView() {
        if (this._data) {
            this.node.x = this._data.x;
            this.node.y = this._data.y;

            this.image_head.node.active = Game.MaidModel.GetTopPass() >= this._data.UlockPassId && Game.MaidModel.GetMaids().length > 0;
            Game.ResController.SetSprite(this.image_head, this._data.Headpath);
            if (Game.MaidModel.GetTopPass() >= this._data.UlockPassId && Game.MaidModel.GetMaids().length > 0) {
                Game.ResController.SetSprite(this.image_palace, this._data.UlockPath);
            } else {
                Game.ResController.SetSprite(this.image_palace, this._data.Lockpath);
            }

            this.label_name.string = this._data.Name;
        }
    },

    onOpenPalaceDetail() {
        if (Game.MaidModel.GetTopPass() >= this._data.UlockPassId && Game.MaidModel.GetMaids().length > 0) {
            Game.PalaceModel.SetCurPalaceId(this._data.Id);
            this.openView(Game.UIName.UI_PALACEDETAIL);
        } else {
            this.showTips("宫殿尚未解锁");
        }
    },
});
