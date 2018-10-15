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
        this.closeView(Game.UIName.UI_OFFLINEREWARD, true);
    }
});
