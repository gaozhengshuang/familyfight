
cc.Class({
    extends: cc.Component,

    properties: {
        tableView: { default: null, type: cc.Node }
    },

    onLoad() {
        this.initView();
    },

    start() {
        
    },

    update(dt) {
    },

    onDestroy() {
    },

    _getdata: function (num) {
        var array = [];
        for (var i = 0; i < num; ++i) {
            var obj = {};
            obj.name = 'a' + i;
            array.push(obj);
        }
        return array;
    },
    initView: function () {
        var data = this._getdata(100);
        this.tableView.getComponent(cc.tableView).initTableView(data.length, { array: data, target: this });
    },
});
