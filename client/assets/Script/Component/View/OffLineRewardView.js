const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_gold: { default: null, type: cc.Label },
    },

    onLoad() {
        this.label_gold.string = Game.Tools.UnitConvert(Game.UserModel.GetOffLineReward().gold);
    },

    onClosePanel() {
        Game.CurrencyModel.AddGold(Game.UserModel.GetOffLineReward().gold);
        this.closeView(Game.UIName.UI_OFFLINEREWARD, true);
    }
});
