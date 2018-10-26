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

        anima_dialogue: { default: null, type: cc.Animation },
        guessIndex: { default: 0 },
        clickFunc: { default: null }
    },

    onEnable() {
    },
    init(data, clickFunc) {
        this.clickFunc = clickFunc;
        if (data) {
            this.node.active = true;
            this.label_playername.string = data.name;
            let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", data.palace.id);
            if (palaceMapBase) {
                Game.ResController.SetSprite(this.image_card, palaceMapBase.BannerPath);
            }
        } else {
            this.node.active = false;
        }
    },
    onGuess() {
        Game.Tools.InvokeCallback(this.clickFunc, this.guessIndex);
    },

    SetDialogue: function (dialogue, withanima) {
        this.anima_dialogue.setCurrentTime(0, this.anima_dialogue.defaultClip.name);
        this.label_dailogue.string = dialogue;
        if (withanima) {
            this.anima_dialogue.play();
        }
    },
    SetQuestion: function (imgname, withanima) {
        let duration = 0;
        if (withanima) {
            let scaleX = this.image_question.node.scaleX;
            let scaleY = this.image_question.node.scaleY;
            let action = cc.sequence([
                cc.repeat(
                    cc.sequence([
                        cc.scaleTo(0.3, -scaleX, scaleY),
                        cc.scaleTo(0.3, scaleX, scaleY),
                    ]),
                    4
                ),
                cc.fadeOut(0.05),
                cc.callFunc(function () {
                    Game.ResController.SetSprite(this.image_question, imgname);
                }, this),
                cc.fadeIn(0.05)
            ]);
            duration = action.getDuration();
            this.image_question.node.runAction(action);
        } else {
            Game.ResController.SetSprite(this.image_question, imgname);
        }
        return duration;
    }
});
