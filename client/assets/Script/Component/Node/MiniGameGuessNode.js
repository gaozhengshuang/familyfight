const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_card: { default: null, type: cc.Sprite },
        image_question: { default: null, type: cc.Sprite },
        image_playerhead: { default: null, type: cc.Sprite },
        label_playername: { default: null, type: cc.Label },
        label_dailogue: { default: null, type: cc.Label },
        guessIndex: { default: 0 }
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PARTLVUP_ACK, this, this.updateView);
    },

    updateView() {
             
    },

    onGuess() {
        
    },
});
