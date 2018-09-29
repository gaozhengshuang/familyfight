const Game = require('../../Game');

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

        this.passClickTrue_img.node.active = Game.MaidModel.GetCurPass() == this._data.Id;
        Game.ResController.SetSprite(this.pass_img, this._data.Path);
    },

    clicked() {
        if (this._data.Id != Game.MaidModel.GetCurPass()) {
            Game.MaidModel.SetCurPass(this._data.Id);

            Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW);
        }

        let _dialoguePass = JSON.parse(cc.sys.localStorage.getItem('dialoguePass'));
        if (this._data.Id == Game.MaidModel.GetTopPass() && _dialoguePass.pass < this._data.Id) {
            if (this._data.DialogueID != 0) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this._data.DialogueID);

                let passData = {
                    userid: Game.UserModel.GetUserId(),
                    pass: this._data.Id,
                };
                cc.sys.localStorage.setItem('passData', JSON.stringify(passData));
            }
        }
    }
});
