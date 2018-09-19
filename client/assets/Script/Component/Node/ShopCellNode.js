const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        image_button: { default: null, type: cc.Sprite },
        label_maid: { default: null, type: cc.Label },
        label_gold: { default: null, type: cc.Label },
    },

    // use this for initialization
    onLoad() {

    },

    init(index, data, reload, group) {
        this._target = data.target;
        this._data = data.array[index];

        let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", this._data.id);
        if (maidBase) {
            Game.ResController.SetSprite(this.image_maid, maidBase.Path);
            this.label_maid.string = maidBase.Name;
        }
        this.label_gold.string = `+${this._data.price}`;
        if (Game.UserModel.GetGold() >= this._data.price) {
            Game.ResController.SetSprite(this.image_button, "Image/GameScene/Common/button_common");
        } else {
            Game.ResController.SetSprite(this.image_button, "Image/GameScene/Common/button_common2");
        }
    },

    buyShop() {
        if (Game.UserModel.GetGold() >= this._data.price) {
            Game.NetWorkController.Send('msg.C2GW_ReqBuyMaid', {maidid: this._data.id});
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, { text: '<color=#ffffff>' + '金币不足哟!' + '</color>' });
        }
    },

    clicked() {

    }
});
