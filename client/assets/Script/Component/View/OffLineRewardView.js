const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_gold: { default: null, type: cc.Label },
    },

    onLoad() {
        this.label_gold.string = Game.Tools.UnitConvert(Game.CurrencyModel.offLineReward.golds);
    },

    onClosePanel() {
        Game.CurrencyModel.AddGold(Game.CurrencyModel.offLineReward.golds);
        Game.CurrencyModel.offLineReward = null;
        this.closeView(Game.UIName.UI_OFFLINEREWARD, true);

        if (Game.GuideController.IsGuide()) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.GUIDE_OPEN);
        }
    }
});
