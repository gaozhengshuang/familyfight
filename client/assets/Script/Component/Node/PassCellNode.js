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
        
        if (Game.MaidModel.GetTopPass() >= this._data.Id) {
            Game.ResController.SetSprite(this.pass_img, this._data.Path);
        } else {
            Game.ResController.SetSprite(this.pass_img, "Image/GameScene/Common/button_unlockpass");
        }

        // if (this._data.Id == Game.MaidModel.GetCurPass()) {
        //     this.node.setScale(1.2);
        // } else {
        //     this.node.setScale(1);
        // }

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

        if (this._data.Id == Game.MaidModel.GetCurPass() && this._data.Id == Game.MaidModel.GetTopPass()) {     //最高关卡给服务器发送引导需要的数据
            Game.NetWorkController.Send('msg.C2GW_NotifyOpenLevel', {
                level: this._data.Id,
            });
        }
    },

    clicked() {        
        if (Game.MaidModel.GetTopPass() >= this._data.Id) {     //已经解锁的关卡
            if (this._data.Id != Game.MaidModel.GetCurPass()) {
                Game.MaidModel.SetCurPass(this._data.Id);
    
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS);
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW);
            }
            Game.GuideController.NextGuide();
    
            let _dialoguePass = JSON.parse(cc.sys.localStorage.getItem('dialoguePass'));
            if (this._data.Id == Game.MaidModel.GetTopPass() && _dialoguePass.pass < this._data.Id) {
                let passData = {
                    userid: Game.UserModel.GetUserId(),
                    lookPass: _dialoguePass.lookPass,
                    pass: this._data.Id,
                };
                cc.sys.localStorage.setItem('dialoguePass', JSON.stringify(passData));
                
                if (this._data.DialogueID != 0) {                    
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, this._data.DialogueID);
                }
            }
        } else {
            Game.ViewController.openView(Game.UIName.UI_PASSDETAILVIEW);
        }
    },

    onStop(event) {
        var state = event.detail;    // state instanceof cc.AnimationState
        var type = event.type;       // type === 'strop';
        this.animation_light.node.active = false;
    }
});
