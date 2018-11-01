const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },

        sharetime: { default: 0 },
        levelid: { default: 0 },
        leveldefine: { default: null },
        closefunc: { default: null }
    },

    onLoad() {
    },

    onEnable() {
        this.sharetime = Game.TimeController.GetCurTime();
        this.levelid = Game._.get(this._data, 'levelid', 0);
        this.closefunc = Game._.get(this._data, 'closefunc', null);
        this.leveldefine = Game.ConfigController.GetConfigById('PassLevels', this.levelid);
        this.updateView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    updateView() {
        if (this.leveldefine) {
            Game.ResController.SetSprite(this.image_maid, this.leveldefine.Path);
            this.label_name.string = '开启第' + this.levelid + '关';
        }
    },

    onClose() {
        this.closeView(Game.UIName.UI_NEWLEVELVIEW);
        Game.Tools.InvokeCallback(this.closefunc);
    },
    onShare() {
        Game.Platform.ShareMessage(Game.Define.SHARETYPE.ShareType_NewLevel, this.levelid, this.sharetime);
    }
});
