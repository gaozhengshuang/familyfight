const Game = require('../../Game');
const GuessStatus = {
    Status_Show: 1,
    Status_Idle: 2,
    Status_Wait: 3,
    Status_PreGuess: 4,
    Status_Guess: 5,
    Status_End: 6,
}

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
        anima_show: { default: null, type: cc.Animation },
        anima_tip: { default: null, type: cc.Animation },
        nodes_guess: { default: [], type: [require('../Node/MiniGameGuessNode')] },

        status: { default: 0 },
        result: { default: null },
        clickIndex: { default: 0 }
    },

    onLoad() {
    },

    onEnable() {
        this.initNotification();
        this._changeStatus(GuessStatus.Status_Show);
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUESSKING_ACK, this, this.onAckGuessKing);
        this.anima_show.off('stop', this.onShowPlayEnd, this);
        this.anima_tip.off('stop', this.onTipPlayEnd, this);
    },

    onShowPlayEnd() {
        this._changeStatus(GuessStatus.Status_Idle);
    },
    onTipPlayEnd() {
        if (this.status == GuessStatus.Status_Idle) {
            this._changeStatus(GuessStatus.Status_Wait);
        }
    },
    onPalaceClick(index) {
        if (this.status == GuessStatus.Status_Wait) {
            console.log(index);
            this.clickIndex = index;
            let data = Game.MiniGameModel.GetGuessKingData()[index];
            Game.NetWorkController.Send("msg.C2GW_ReqGuessKing",
                {
                    id: data.id,
                    index: index
                });
            this._changeStatus(GuessStatus.Status_PreGuess);
        }
    },

    onAckGuessKing(data) {
        console.log(data);
        if (this.status == GuessStatus.Status_PreGuess) {
            this.result = data;
            this._changeStatus(GuessStatus.Status_Guess);
        }
    },
    initNotification() {
        this.anima_show.on('stop', this.onShowPlayEnd, this);
        this.anima_tip.on('stop', this.onTipPlayEnd, this);
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUESSKING_ACK, this, this.onAckGuessKing);
    },

    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case GuessStatus.Status_Show: {
                    this.clickIndex = 0;
                    this.result = null;
                    this.tip_show.active = true;
                    this.tip_guess.active = false;
                    this.tip_noguess.active = false;
                    this.label_dailogue.string = "猜猜朕藏在哪个宫？";
                    this.label_dailogue.node.opacity = 0;
                    this.label_dailogue.node.scaleX = 0.8;
                    this.label_dailogue.node.scaleY = 0.8;
                    for (let i = 0; i < this.nodes_guess.length; i++) {
                        let node = this.nodes_guess[i];
                        let data = Game.MiniGameModel.GetGuessKingData()[i];
                        node.init(data, this.onPalaceClick.bind(this));
                        node.SetDialogue('', false);
                        node.SetQuestion('Image/GameScene/Minigame/image_question', false);
                    };
                    this.anima_show.play();
                    break;
                }
                case GuessStatus.Status_Idle: {
                    this.anima_tip.play();
                    this.label_dailogue.node.runAction(cc.spawn([
                        cc.fadeTo(0.2, 255),
                        cc.scaleTo(0.2, 1, 1)
                    ]));
                    break;
                }
                case GuessStatus.Status_Wait: {
                    break;
                }
                case GuessStatus.Status_PreGuess: {
                    break;
                }
                case GuessStatus.Status_Guess: {
                    //结果回来了，播放动画
                    let duration = 0;
                    for (let i = 0; i < this.nodes_guess.length; i++) {
                        let node = this.nodes_guess[i];
                        duration = node.SetQuestion(i == this.result.index ? "Image/GameScene/Minigame/image_king" : "Image/GameScene/Minigame/image_noking", true);
                    }
                    this.node.runAction(cc.sequence([
                        cc.delayTime(duration + 0.1),
                        cc.callFunc(function () {
                            //牌子翻完了
                            let guessData = Game.MiniGameModel.GetGuessKingData()[this.result.index];
                            let golds = Game._.get(Game.RewardController.GetLastReward(), 'rewards.golds', []);
                            if (this.result.hit) {
                                this.label_dailogue.string = "恭喜你，猜中了！";
                                this.label_guessName.string = guessData.name;
                                this.label_guessGold.string = Game.Tools.UnitConvert(golds);
                            } else {
                                this.label_dailogue.string = "很遗憾，没有猜中！";
                                this.label_noguessGold.string = Game.Tools.UnitConvert(golds);
                            }
                            this.tip_show.active = false;
                            this.tip_guess.active = this.result.hit;
                            this.tip_noguess.active = !this.result.hit;

                            this.label_dailogue.node.opacity = 0;
                            this.label_dailogue.node.scaleX = 0.8;
                            this.label_dailogue.node.scaleY = 0.8;
                            this.label_dailogue.node.runAction(cc.spawn([
                                cc.fadeTo(0.2, 255),
                                cc.scaleTo(0.2, 1, 1)
                            ]));
                            this.anima_tip.play();
                            let node = this.nodes_guess[this.clickIndex];
                            if (node) {
                                node.SetDialogue(this.result.hit ? '哼!算你运气好!' : '总有人想勾引朕!', true);
                            }
                        }, this),
                        cc.delayTime(0.5),
                        cc.callFunc(function () {
                            Game.RewardController.PlayLastReward();
                        }),
                        cc.delayTime(3),
                        cc.callFunc(function () {
                            this._changeStatus(GuessStatus.Status_End);
                        }, this)
                    ]))
                    break;
                }
                case GuessStatus.Status_End: {
                    this.onClose();
                    break;
                }
                default:
                    break;
            }
        }
    },
});
