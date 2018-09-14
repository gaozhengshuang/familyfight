import Game from '../../Game';

cc.Class({
    extends: cc.Component,

    properties: {
        accEditBox: { default: null, type: cc.EditBox, },
        targetCanvas: { default: null, type: cc.Canvas }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Game.Tools.AutoFit(this.targetCanvas);
        
        Game.NotificationController.On(Game.Define.EVENT_KEY.CONNECT_TO_GATESERVER, this, this.onLoginComplete);
    },

    start() {
       let account = cc.sys.localStorage.getItem('account');
       if (account) {
           this.accEditBox.string = account;
       }
    },

    update(dt) {

    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.CONNECT_TO_GATESERVER, this, this.onLoginComplete);
    },

    onStartGame() {
        if (this.accEditBox.string == '') {
            return;
        }
        this.onLoginPlatfrom();
    },

    onLoginPlatfrom() {
        let loginInfo = {
            account: this.accEditBox.string,
            nickname: this.accEditBox.string,
            face: '',
            token: ''
        }
        cc.sys.localStorage.setItem('account', this.accEditBox.string);
        Game.UserModel.loginInfo = loginInfo;
        Game.LoginController.ConnectToLoginServer(function () {
            Game.NetWorkController.Send('msg.C2L_ReqLogin', loginInfo);
        }.bind(this));
    },

    onLoginComplete(msgid, data) {
        cc.director.loadScene("GameScene");
    },
});
