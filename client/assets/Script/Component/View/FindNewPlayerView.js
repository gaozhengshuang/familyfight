const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },
        label_sharenum: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.sharetime = Game.TimeController.GetCurTime();
        this.updateView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    initData() {
        this.maidBase = null;
    },

    updateView() {
        this.maidBase = Game.ConfigController.GetConfigById("TMaidLevel", Game.MaidModel.GetTopMaid());
        if (this.maidBase) {
            Game.ResController.SetSprite(this.image_maid, this.maidBase.Path);
            this.label_name.string = this.maidBase.Name;
            this.label_sharenum.string = Game.Tools.UnitConvert(Game.Tools.toLocalMoney(Game.Tools.toBigIntMoney(this.maidBase.Reward).multiply(3600 * 6)));
        }
    },

    onClose() {
        if (this.maidBase) {    //解锁新人弹剧情
            if (this.maidBase.DialogueID != 0) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this.maidBase.DialogueID);
            }
        }

        this.closeView(Game.UIName.UI_FINDNEWPLAYER);
        Game.GuideController.NextGuide();
    },
    onShare() {
        Game.Platform.ShareMessage(Game.Define.SHARETYPE.ShareType_NewMaid, this.maidBase.Id, this.sharetime);
    }
});
