const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node },
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
        this.palaceList = [];
        this.palaceMapBase = Game.ConfigController.GetConfig("PalaceMap");

        this.tableViewComponent = this.tableView.getComponent(cc.tableView);
    },

    updateView() {
        this.palaceList = Game._.sortBy(this.palaceMapBase, function(palaceMap) {
            return palaceMap.Id;
        });
        
        this.tableViewComponent.initTableView(this.palaceList.length, {array: this.palaceList, target: this});
    },
    
    onOpenTravel(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_TRAVELVIEW);
    },

    onOpenEvent(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_EVENTVIEW);
    },

});
