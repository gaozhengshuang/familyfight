const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        passClickTrue_img: { default: null, type: cc.Sprite },
        pass_img: { default: null, type: cc.Sprite },
        animation_light: { default: null, type: cc.Animation }
    },

    // use this for initialization
    onLoad() {
        this.animation_light.node.active = false;
        this.animation_light.on('stop', this.onStop, this);
    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        this.passClickTrue_img.node.active = Game.MaidModel.GetCurPass() == this._data.Id;
        Game.ResController.SetSprite(this.pass_img, this._data.Path);

        let _dialoguePass = JSON.parse(cc.sys.localStorage.getItem('dialoguePass'));    //判断关卡第一次开放
        if ((this._data.Id == Game.MaidModel.GetTopPass() && _dialoguePass.lookPass < this._data.Id)) {
            let passData = {
                userid: _dialoguePass.userid,
                lookPass: this._data.Id,
                pass: _dialoguePass.pass,
            };
            cc.sys.localStorage.setItem('dialoguePass', JSON.stringify(passData));

            this.animation_light.node.active = true;
            this.animation_light.play("FlashNewPass");
        }
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
                let passData = {
                    userid: Game.UserModel.GetUserId(),
                    lookPass: _dialoguePass.lookPass,
                    pass: this._data.Id,
                };
                cc.sys.localStorage.setItem('dialoguePass', JSON.stringify(passData));
                
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this._data.DialogueID);
            }
        }
    },

    onStop(event) {
        var state = event.detail;    // state instanceof cc.AnimationState
        var type = event.type;       // type === 'strop';
        this.animation_light.node.active = false;
    }
});
