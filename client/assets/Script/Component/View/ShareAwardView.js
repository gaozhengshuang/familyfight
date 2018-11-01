const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        showAnimation: { default: null, type: cc.Animation },

        sharetype: { default: null },
        shareid: { default: null },
        enableTime: { default: 0 }
    },
    onEnable: function () {
        this.showAnimation.play();
        this.sharetype = Game._.get(this._data, 'sharetype', 0);
        this.shareid = Game._.get(this._data, 'shareid', 0);
        this.enableTime = Game.TimeController.GetCurTime();
        Game.NotificationController.On(Game.Define.EVENT_KEY.ON_SHOWGAME, this, this.onShowGame);
    },
    onDisable: function () {
        this.showAnimation.stop();
        Game.NotificationController.Off(Game.Define.EVENT_KEY.ON_SHOWGAME, this, this.onShowGame);
    },
    onShowGame: function(){
        this.onClose();
    },
    onShareClick: function () {
        Game.Platform.ShareMessage(this.sharetype, this.shareid, this.enableTime);
    }
});
