import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        label_name: { default: null, type: cc.Label },
    },

    onLoad() {
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    setData(_playerId) {
        let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", _playerId);
        if (maidBase) {
            Game.ResController.SetSprite(this.image_maid, maidBase.Path);
            this.label_name.string = maidBase.Name;
        }
    },

    onClose() {
        this.node.destroy();
    }
});
