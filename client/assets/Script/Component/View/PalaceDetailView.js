const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {

    },

    onLoad() {
        this.initData();
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
        
    },

    updateView() {
       
    },

    onOpenLvUp() {
        this.openView(Game.UIName.UI_PALACEMASTERLVUP);
    },
});
