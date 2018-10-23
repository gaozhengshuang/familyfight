const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node },
        button_handbook: { default: null, type: cc.Button },
        button_randomx: { default: null, type: cc.Button },
        label_handbookUnlock: { default: null, type: cc.Label },
        label_randomxUnlock: { default: null, type: cc.Label },
        label_randomxNum: { default: null, type: cc.Label },
    },

    onLoad() {
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
        this.updateBottomButton();
    },

    onDisable() {
        this.removeNotification();
    },

    initData() {
        this.palaceList = [];
        this.palaceMapBase = Game.ConfigController.GetConfig("PalaceMap");

        this.tableViewComponent = this.tableView.getComponent(cc.tableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
    },

    updateView() {
        this.palaceList = Game._.sortBy(this.palaceMapBase, function(palaceMap) {
            return palaceMap.Id;
        });
        
        this.tableViewComponent.initTableView(this.palaceList.length, {array: this.palaceList, target: this});
        this.label_randomxNum.string = `${Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.TRYST)}次`;
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
        Game.GuideController.NextGuide();
    },

    onOpenEvent(event) {
        event.stopPropagationImmediate();
        this.openView(Game.UIName.UI_EVENTVIEW);
        Game.GuideController.NextGuide();
    },

    onOpenRandomX(event) {
        event.stopPropagationImmediate();
        // if (Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.TRYST) < 1) {
        //     this.showTips("前去翻牌子获得游戏次数");
        //     return;
        // }
        this.openView(Game.UIName.UI_PALACEDATE);
        Game.GuideController.NextGuide();
    }
});
