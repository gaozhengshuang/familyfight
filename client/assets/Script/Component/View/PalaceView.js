const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node },
        button_handbook: { default: null, type: cc.Button },
        button_bestowed: { default: null, type: cc.Button },
        label_handbookUnlock: { default: null, type: cc.Label },
        label_bestowedUnlock: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.updateView();
        this.updateBottomButton();
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

    updateBottomButton() {
        let handbookLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.HANDBOOK);
        this.button_handbook.interactable = handbookLock;
        this.label_handbookUnlock.node.active = !handbookLock;

        let bestowedLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.BESTOWED);
        this.button_bestowed.interactable = bestowedLock;
        this.label_bestowedUnlock.node.active = !bestowedLock;
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
