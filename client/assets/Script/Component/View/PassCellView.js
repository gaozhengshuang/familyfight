import Game from '../../Game';

cc.Class({
    extends: require('viewCell'),

    properties: {
        passClickTrue_img: { default: null, type: cc.Sprite },
        pass_img: { default: null, type: cc.Sprite }
    },

    // use this for initialization
    onLoad() {

    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        this.passClickTrue_img.node.active = Game.UserModel.GetCurPass() == this._data.Id;
        Game.ResController.SetSprite(this.pass_img, this._data.Path);
    },

    clicked() {
        if (this._data.Id != Game.UserModel.GetCurPass()) {
            Game.UserModel.SetCurPass(this._data.Id);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_PLAYER);
        }        
    }
});
