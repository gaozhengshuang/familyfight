import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
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

    setData(_playerId) {
        this.maidBase = Game.ConfigController.GetConfigById("TMaidLevel", _playerId);
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

        this.node.destroy();
    }
});
