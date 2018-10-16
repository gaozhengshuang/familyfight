const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node },
        button_handbook: { default: null, type: cc.Button },
        button_randomx: { default: null, type: cc.Button },
        label_handbookUnlock: { default: null, type: cc.Label },
        label_randomxUnlock: { default: null, type: cc.Label },
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

        let randomxLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.RANDOMX);
        this.button_randomx.interactable = randomxLock;
        this.label_randomxUnlock.node.active = !randomxLock;
    },
    
    onOpenTravel(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_TRAVELVIEW);
    },

    onOpenEvent(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_EVENTVIEW);
    },

    onOpenRandomX(event) {
        event.stopPropagationImmediate();
    }
});
