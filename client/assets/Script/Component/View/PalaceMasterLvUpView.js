const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_master: { default:null, type:cc.Sprite },
        image_lvUp: { default:null, type:cc.Sprite },
        label_tltie: { default:null, type:cc.Label },
        label_name: { default:null, type:cc.Label },
        label_detail: { default:null, type:cc.Label },
        label_lvTitle: { default:null, type:cc.Label },
        label_maidNum: { default:null, type:cc.Label },
        label_goldNum: { default:null, type:cc.Label },
        label_cardNum: { default:null, type:cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.updateView();
    },

    update(dt) {
    },

    onDisable() {
    },

    initData() {
        
    },

    updateView() {
        this._data = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this._data.id);
        if (palaceMapBase) {
            let masterLvUpBase = Game.PalaceModel.GetPalaceMasterLvUpBase(palaceMapBase.Master, this._data.level);  //主人升级相关
            if (masterLvUpBase) {
                let lvItemBase = masterLvUpBase.LevelupCost[0];
                if (lvItemBase) {
                    let item_num = lvItemBase.split("_");
                    if (item_num) {
                        if (Game.ItemModel.GetItemNumById(item_num[0]) >= item_num[1]) {
                            Game.ResController.SetSprite(this.image_lvUp, "Image/GameScene/Common/button_common");
                        } else {
                            Game.ResController.SetSprite(this.image_lvUp, "Image/GameScene/Common/button_common2");
                        }
                        this.label_cardNum.string = '所需卡牌' + Game.ItemModel.GetItemNumById(item_num[0]) + "/" + item_num[1];
                    }
                }
            }
        }
    },

    onLvUp() {

    },
});
