let Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.tableView },
    },
    onEnable: function () {
        this.tableView.clear();
        let events = Game.TravelModel.eventConfigs;
        this.tableView.initTableView(events.length, { array: events, target: this });
    },
    onItemClick: function (eventid) {
        if (Game.TravelModel.IsEventOpen(eventid)) {
            //打开事件吧
            Game.GuideController.NextGuide();
            Game.TravelModel.SetOpenEvent(eventid);
            this.openView(Game.UIName.UI_EVENTDETAILVIEW, { showBarrage: true });
        } else {
            //提示
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, "该事件尚未解锁!");
        }
    }
});
