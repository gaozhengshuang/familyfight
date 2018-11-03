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
        image_reddi: { default: null, type: cc.Sprite },
        node_widget: { default: null, type: cc.Node },
    },

    onLoad() {
        let viewSize = cc.view.getVisibleSize();
        this.node_widget.width = viewSize.width;
        this.node_widget.height = viewSize.height;
        this.initData();
    },

    onEnable() {
        this.initNotification();
        this.updateView();
        this.updateBottomButton();
        Game.AudioController.PlayMusic('Audio/bg3');
    },

    onDisable() {
        this.removeNotification();
        Game.AudioController.StopMusic();
    },

    initData() {
        this.palaceList = [];
        this.palaceMapBase = Game.ConfigController.GetConfig("PalaceMap");

        this.tableViewComponent = this.tableView.getComponent(cc.tableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },

    removeNotification() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.GUIDE_ACK, this, this.updateBottomButton);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },

    updateView() {
        this.palaceList = Game._.sortBy(this.palaceMapBase, function (palaceMap) {
            return palaceMap.Id;
        });

        this.tableViewComponent.initTableView(this.palaceList.length, { array: this.palaceList, target: this });

        this.updateMiniGameCoin();
    },

    updateBottomButton() {
        let handbookLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.HANDBOOK);
        this.button_handbook.interactable = handbookLock;
        this.label_handbookUnlock.node.active = !handbookLock;

        let randomxLock = Game.MaidModel.IsOpenFunction(Game.Define.FUNCTION_UNLOCK.RANDOMX);
        this.button_randomx.interactable = randomxLock;
        this.label_randomxUnlock.node.active = !randomxLock;
    },

    updateMiniGameCoin() {
        this.image_reddi.node.active = Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.TRYST) > 0;
        this.label_randomxNum.string = `${Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.TRYST)}次`;
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
        this.openView(Game.UIName.UI_PALACEDATE);
        Game.GuideController.NextGuide();
    }
});
