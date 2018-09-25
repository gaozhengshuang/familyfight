const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
    },

    update(dt) {
    },

    onEnable() {
        this.updateView();
    },

    updateView() {
        let _tbList = Game._.sortBy(Game.PalaceModel.GetPalaceTakeBack().items, function(item) {
            return Game.ConfigController.GetConfigById("ItemBaseData", item.itemid).Sort;
        });
        this.tableView.getComponent(cc.tableView).initTableView(_tbList.length, { array: _tbList, target: this });
    },
});
