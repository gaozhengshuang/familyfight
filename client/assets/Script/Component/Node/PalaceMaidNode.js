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

    setData(id, index) {
        this._maidId = id;
        this._index = index;
    },

    updateView() {
        this.palaceData = Game.PalaceModel.GetPalaceDataById(Game.PalaceModel.GetCurPalaceId());
        this.palaceMaidBase = Game.ConfigController.GetConfigById("PalaceMapMaid", this._maidId);
        this.maidBase = Game.ConfigController.GetConfigById("PalacePersonnel", this._maidId);
        if (this.palaceData && this.palaceMaidBase && this.maidBase) {
            if (this.palaceData.maids[this._index]) {     //已经解锁
                Game.ResController.SetSprite(this.image_maid, this.maidBase.Path);
                this.image_gold.node.active = false;
                this.label_lockLv.string = '';
            } else {
                if (this.palaceData.level >= this.palaceMaidBase.OpenLevel) {     //达到开放等级
                    Game.ResController.SetSprite(this.image_maid, this.maidBase.Path);
                    this.image_gold.node.active = true;
                    this.label_lockLv.string = '';
                    this.label_gold.string = `${Game.Tools.UnitConvert(this.palaceMaidBase.UnlockPrice)}`;
                } else {
                    Game.ResController.SetSprite(this.image_maid, "Image/GameScene/Common/image_maidLock");
                    this.image_gold.node.active = false;
                    this.label_lockLv.string = `主位${this.palaceMaidBase.OpenLevel}级解锁`
                    this.label_gold.string = '';
                }
            }
            this.label_name.string = this.maidBase.Name;
        }
    },

    getIndex() {
        return this._index;
    },

    getMaidBase() {
        return this.palaceMaidBase;
    },

    openDetail() {
        Game.PalaceModel.SetPalaceCurMaidIndex(this._index);
        this.openView(Game.UIName.UI_PALACEMAIDDETAIL);
        Game.GuideController.NextGuide();
    },
});
