const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        image_maid: { default:null, type:cc.Sprite },
        image_gold: { default:null, type:cc.Sprite },
        label_name: { default:null, type:cc.Label },
        label_gold: { default:null, type:cc.Label },
        label_lockLv: { default:null, type:cc.Label },
    },

    onLoad() {
        this.updateView();
    },

    onDestroy() {
    },

    update(dt) {
    },

    setData(id, index) {
        this._maidId = id;
        this._index = index;
    },

    updateView() {
        let palaceData = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        let palaceMaidBase = Game.ConfigController.GetConfigById("PalaceMapMaid", this._maidId);
        let maidBase = Game.ConfigController.GetConfigById("TMaidLevel", this._maidId);
        if (palaceData && palaceMaidBase && maidBase) {
            if (palaceData.maids[this._index]) {     //已经解锁
                Game.ResController.SetSprite(this.image_maid, maidBase.Path);
                this.image_gold.node.active = false;
                this.label_lockLv.string = '';
            } else {
                if (palaceData.level >= palaceMaidBase.OpenLevel) {     //达到开放等级
                    Game.ResController.SetSprite(this.image_maid, maidBase.Path);
                    this.image_gold.node.active = true;
                    this.label_lockLv.string = '';
                    this.label_gold.string = `X${palaceMaidBase.UnlockPrice}`;
                } else {
                    Game.ResController.SetSprite(this.image_maid, "Image/GameScene/Common/image_maidLock");
                    this.image_gold.node.active = false;
                    this.label_lockLv.string = `主位${palaceMaidBase.OpenLevel}级解锁`
                    this.label_gold.string = '';
                }
            }
            this.label_name.string = maidBase.Name;
        }
    },

    openDetail() {
        Game.PalaceModel.SetPalaceCurMaidIndex(this._index);
        this.openView(Game.UIName.UI_PALACEMAIDDETAIL);
    },
});
