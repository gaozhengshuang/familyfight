const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_maid: { default:null, type:cc.Sprite },
        label_name: { default:null, type:cc.Label },
        label_findNum: { default:null, type:cc.Label },
        label_findDetail: { default:null, type:cc.Label },
        label_lockLv: { default:null, type:cc.Label },
        label_gold: { default:null, type:cc.Label },
        node_buy: { default:null, type:cc.Node },
        image_buy: { default:null, type:cc.Sprite },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
    },

    onDisable() {
        this.removeNotification();
    },

    initData() {
        this._index = null;
        this._lockGold = 0 ;
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.PALACEMAID_UNLOCK, this, this.updateView);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.PALACEMAID_UNLOCK, this, this.updateView);
    },

    updateView() {
        this._index = Game.PalaceModel.GetPalaceCurMaidIndex();
        let palaceData = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", palaceData.id);
        let palaceMaidBase = Game.ConfigController.GetConfigById("PalaceMapMaid", palaceMapBase.Maids[this._index]);
        let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", palaceMapBase.Maids[this._index]);
        if (palaceData && palaceMapBase && palaceMaidBase && maidBase) {
            if (palaceData.maids[this._index]) {     //已经解锁
                Game.ResController.SetSprite(this.image_maid, maidBase.Path);
                this.node_buy.active = false;
                this.label_lockLv.node.active = false;
            } else {
                if (palaceData.level >= palaceMaidBase.OpenLevel) {     //达到开放等级
                    Game.ResController.SetSprite(this.image_maid, maidBase.Path);
                    this.node_buy.active = true;
                    this.label_lockLv.node.active = false;
                } else {
                    Game.ResController.SetSprite(this.image_maid, "Image/GameScene/Common/image_maidLock");
                    this.node_buy.active = false;
                    this.label_lockLv.node.active = true;
                }
            }

            if (Game.UserModel.GetGold() >= palaceMaidBase.UnlockPrice) {
                Game.ResController.SetSprite(this.image_buy, "Image/GameScene/Common/button_common");
            } else {
                Game.ResController.SetSprite(this.image_buy, "Image/GameScene/Common/button_common2");
            }

            this.label_findNum.string = `每秒产${palaceMaidBase.GoldAddition}`;
            this.label_findDetail.string = palaceMaidBase.Describe;
            this.label_name.string = maidBase.Name + '详情';
            this.label_gold.string = `X${palaceMaidBase.UnlockPrice}`;
            this.label_lockLv.string = `主位${palaceMaidBase.OpenLevel}级解锁`

            this._lockGold = palaceMaidBase.UnlockPrice;
        }
    },

    onReqMaidUnlock() {
        if (Game.UserModel.GetGold() >= this._lockGold) {
            Game.NetWorkController.Send('msg.C2GW_ReqMaidUnlock', 
            {
                id: Game.PalaceModel.GetCurPalaceId(),
                index: this._index
            });
            Game.UserModel.SubtractGold(this._lockGold);
        } else {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, { text: '<color=#ffffff>' + '金币不足哟!' + '</color>' });
        }
    },
});
