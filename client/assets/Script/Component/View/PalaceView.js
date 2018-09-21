const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        perfab_palace: { default: null, type: cc.Prefab },
        node_mainView: { default: null, type: cc.Node },
    },

    onLoad() {
        this.initData();
        this.initView();
    },

    onEnable() {
        this.updateView();
    },

    start() {
    },

    update(dt) {
    },

    onDestroy() {
    },

    initData() {
        this.palaceList = [];
        this.palaceBase = Game.ConfigController.GetConfig("PalaceMap");;
    },

    initView() {
        Game._.forEach(this.palaceBase, function(v) {
            let _palacePrefab = cc.instantiate(this.perfab_palace);
            if (_palacePrefab) {
                let _palace = _palacePrefab.getComponent('PalaceNode');
                if (_palace) {
                    _palace.setData(v);
                }
                this.node_mainView.addChild(_palacePrefab);
                this.palaceList.push(_palace);
            }
        }.bind(this));
    },

    updateView() {
        Game._.forEach(this.palaceList, function(v) {
            v.updateView();
        }.bind(this));
    },
});
