const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
    },

    onEnable() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.CONNECT_TO_GATESERVER, this, this.onClosePanel);
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.CONNECT_TO_GATESERVER, this, this.onClosePanel);
    },

    onClickResetNet() {
        Game.LoginController.ConnectToLoginServer(function () {
            Game.NetWorkController.Send('msg.C2L_ReqLogin', Game.UserModel.loginInfo);
        }.bind(this));
    },

    onClosePanel() {
        this.closeView(Game.UIName.UI_NETFAILED, true);
    }
});
