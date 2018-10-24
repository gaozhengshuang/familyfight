const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_card: { default: null, type: cc.Sprite },
        image_question: { default: null, type: cc.Sprite },
        image_playerhead: { default: null, type: cc.Sprite },
        image_dailogue: { default: null, type: cc.Sprite },
        label_playername: { default: null, type: cc.Label },
        label_dailogue: { default: null, type: cc.Label },
        guessIndex: { default: 0 }
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUESSKING_ACK, this, this.ackGuessKing);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUESSKING_ACK, this, this.ackGuessKing);
    },

    updateView() {
        Game.ResController.SetSprite(this.image_question, "Image/GameScene/Minigame/image_question");
        this.image_dailogue.node.active = false;

        this._data = Game.MiniGameModel.GetGuessKingData()[this.guessIndex];
        if (this._data) {
            this.label_playername.string = this._data.name;
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.palace.id);
            if (palaceMapBase) {
                Game.ResController.SetSprite(this.image_card, palaceMapBase.BannerPath);
            }
        }
    },

    ackGuessKing(data) {
        if (data.result == 0) {
            if (data.index == this.guessIndex) {
                if (data.hit) {
                    this.label_dailogue.string = "哼!算你运气好!";
                } else {
                    this.label_dailogue.string = "总有人想勾引朕!";
                }
                this.image_dailogue.node.active = true;
                Game.ResController.SetSprite(this.image_question, "Image/GameScene/Minigame/image_king");
            } else {
                this.image_dailogue.node.active = false;
                Game.ResController.SetSprite(this.image_question, "Image/GameScene/Minigame/image_noking");
            }
        }
    },

    onGuess() {
        Game.NetWorkController.Send("msg.C2GW_ReqGuessKing",
        {
            id: this._data.id,
            index: this.guessIndex
        })
    },
});
