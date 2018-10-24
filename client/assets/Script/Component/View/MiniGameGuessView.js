const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tip_guess: { default: null, type: cc.Node },
        tip_show: { default: null, type: cc.Node },
        tip_noguess: { default: null, type: cc.Node },

        label_guessName: { default: null, type: cc.Label },
        label_guessGold: { default: null, type: cc.Label },
        label_noguessGold: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUESSKING_ACK, this, this.ackGuessKing);
    },

    initData() {
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUESSKING_ACK, this, this.ackGuessKing);
    },

    updateView() {
        
    },

    ackGuessKing(data) {

    }
});
