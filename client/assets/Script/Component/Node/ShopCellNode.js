const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        image_button: { default: null, type: cc.Sprite },
        label_maid: { default: null, type: cc.Label },
        label_gold: { default: null, type: cc.Label },
        label_reward: { default: null, type: cc.Label },
    },

    onLoad() {
        this.price = 0;
    },

    onEnable() {
        this.initNotification();
    },

    onDisable() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateBtnGold);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEGOLD, this, this.updateBtnGold);
    },

    init(index, data, reload, group) {
        if (index >= Game.MaidModel.GetShopMaids().length) {
            this.node.active = false;
            return;
        }
        this._target = data.target;
        this._data = data.array[index];
        this.price = Math.floor(this._data.price);

        let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", this._data.id);
        if (maidBase) {
            Game.ResController.SetSprite(this.image_maid, maidBase.Path);
            this.label_maid.string = maidBase.Name;
            this.label_reward.string = `${maidBase.Reward}金币/秒`;
        }
        this.updateBtnGold();
    },

    buyShop() {
        if (Game.UserModel.GetGold() >= this.price) {
            Game.NetWorkController.Send('msg.C2GW_ReqBuyMaid', {maidid: this._data.id});
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, { text: '<color=#ffffff>' + '金币不足哟!' + '</color>' });
        }
    },

    updateBtnGold() {
        this.label_gold.string = `+${Game.Tools.UnitConvert(this.price)}`;
        if (Game.UserModel.GetGold() >= this.price) {
            Game.ResController.SetSprite(this.image_button, "Image/GameScene/Common/button_common");
        } else {
            Game.ResController.SetSprite(this.image_button, "Image/GameScene/Common/button_common2");
        }
    },

    clicked() {

    }
});
