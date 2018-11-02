const Game = require('../../Game');

cc.Class({
    extends: require('viewCell'),

    properties: {
        image_maid: { default: null, type: cc.Sprite },
        image_button: { default: null, type: cc.Sprite },
        label_gold: { default: null, type: cc.Label },
        label_reward: { default: null, type: cc.Label },
        label_name: { default: null, type: cc.Label },
        label_getnum: { default: null, type: cc.Label },
        button_buy: { default: null, type: cc.Button },

        maid: { default: null },
        shop: { default: null }
    },

    onLoad() {
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

    init(maid, shopinfo) {
        this.maid = maid;
        this.shopinfo = shopinfo;
        Game.ResController.SetSprite(this.image_maid, maid.Path);
        this.label_name.string = maid.Name;
        this.label_reward.string = `${Game.Tools.UnitConvert(maid.Reward)}金币/秒`;
        if (maid.Id > Game.MaidModel.GetTopMaid()) {
            this.image_maid.node.color = cc.Color.BLACK;
            this.image_maid.node.opacity = 150;
        } else {
            this.image_maid.node.color = cc.Color.WHITE;
            this.image_maid.node.opacity = 255;
        }
        if (shopinfo == null) {
            this.label_getnum.string = '';
            let config = Game.ConfigController.GetConfigById('TMaidShop', maid.Id);
            this.price = Game._.get(config, 'Price', ['0_0']);
        } else {

            this.label_getnum.string = `(已购买${shopinfo.times}个)`;
            this.price = shopinfo.price;
        }
        this.updateBtnGold();
    },

    buyShop() {
        if (this.shopinfo == null) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "尚未解锁商品!");
        }
        else if (Game.CurrencyModel.CompareGold(this.price) >= 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.USERINFO_SUBTRACTGOLD, this.price);
            Game.NetWorkController.Send('msg.C2GW_ReqBuyMaid', { maidid: this.shopinfo.id });
            Game.GuideController.NextGuide();
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "金币不足哟!");
            if (Game.ActiveController.CanGetReward(Game.Define.SHARETYPE.ShareType_Shop, 0, Game.TimeController.GetCurTime())) {
                Game.ViewController.openView(Game.UIName.UI_SHAREAWARD, {
                    sharetype: Game.Define.SHARETYPE.ShareType_Shop,
                    shareid: 0
                });
            }
        }
    },

    updateBtnGold() {
        this.label_gold.string = `${Game.Tools.UnitConvert(this.price)}`;
        if (this.shopinfo == null) {
            this.image_button.node.active = false;
        } else {
            this.image_button.node.active = true;
            if (Game.CurrencyModel.CompareGold(this.price) >= 0) {
                this.button_buy.setEffectName('Audio/shopping')
                Game.ResController.SetSprite(this.image_button, "Image/GameScene/Common/button_common");
            } else {
                this.button_buy.setEffectName('Audio/click')
                Game.ResController.SetSprite(this.image_button, "Image/GameScene/Common/button_common2");
            }
        }

    },

    clicked() {

    }
});
