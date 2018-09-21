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
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.updateView();
    },

    onDisable() {
    },

    initData() {
        this._index = null;
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
                    this.node_buy.node.active = true;
                    this.label_lockLv.node.active = false;
                } else {
                    Game.ResController.SetSprite(this.image_maid, "Image/GameScene/Common/image_maidLock");
                    this.node_buy.node.active = false;
                    this.label_lockLv.node.active = true;
                }
            }

            this.label_findNum.string = `每秒产${palaceMaidBase.GoldAddition}`;
            this.label_findDetail.string = palaceMaidBase.Describe;
            this.label_name.string = maidBase.Name + '详情';
            this.label_gold.string = `X${palaceMaidBase.UnlockPrice}`;
            this.label_lockLv.string = `主位${palaceMaidBase.OpenLevel}级解锁`
        }
    },

    onReqMaidUnlock() {
        Game.NetWorkController.Send('msg.C2GW_ReqMaidUnlock', 
        {
            id: Game.PalaceModel.GetCurPalaceId(),
            index: this._index
        });
    },
});
