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
        Game.TravelModel.SetOpenEvent(eventid);
        this.openView(Game.UIName.UI_EVENTDETAILVIEW);
    }
});