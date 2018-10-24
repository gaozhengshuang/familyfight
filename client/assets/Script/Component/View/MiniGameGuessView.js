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
        label_dailogue: { default: null, type: cc.Label },
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
        this.label_dailogue.string = "猜猜朕藏在哪个宫？";
        this.tip_show.active = true;
        this.tip_guess.active = false;
        this.tip_noguess.active = false;
    },

    ackGuessKing(data) {
        if (data.result == 0) {
            let guessData = Game.MiniGameModel.GetGuessKingData()[data.index];
            let golds = Game._.get(Game.RewardController.GetLastReward(), 'rewards.golds', []);
            if (data.hit) {
                this.label_dailogue.string = "恭喜你，猜中了！";
                this.label_guessName.string = guessData.name;
                this.label_guessGold.string = Game.Tools.UnitConvert(golds);
            } else {
                this.label_dailogue.string = "很遗憾，没有猜中！";
                this.label_noguessGold.string = Game.Tools.UnitConvert(golds);
            }
            this.tip_guess.active = data.hit;
            this.tip_noguess.active = !data.hit;
            this.tip_show.active = false;
        }

        setTimeout(function () {
            this.onClose();
        }.bind(this), 2000);
    }
});
