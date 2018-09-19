const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onReset() {
        this.updateView();
    },

    start() {
        this.updateView();
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
        }
    },

    onClose() {
        if (this.maidBase) {    //解锁新人弹剧情
            if (this.maidBase.DialogueID != 0) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this.maidBase.DialogueID);
            }
        }
        
        this.closeView(Game.UIName.UI_FINDNEWPLAYER);
    }
});
