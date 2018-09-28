let Game = require('../../Game');
const SupplyType = {
    Type_Goods: 0,                  //御用品
    Type_Food: 1,                   //御膳
    Type_Cloth: 2,                  //服装
};
const ItemType = [
    Game.Define.ITEM_TYPE.TYPE_TRAVELGOOD,
    Game.Define.ITEM_TYPE.TYPE_TRAVELFOOD,
    Game.Define.ITEM_TYPE.TYPE_TRAVELCLOTH
];
const TabNormalColor = cc.hexToColor('#765544');
const TabSelectColor = cc.hexToColor('#6d282d');
cc.Class({
    extends: cc.GameComponent,
    properties: {
        supplyIconSprites: { default: [], type: [cc.Sprite] },
        supplyDetailLabels: { default: [], type: [cc.Label] },
        tabButtons: { default: [], type: [cc.Button] },
        tabLabelNodes: { default: [], type: [cc.Node] },
        tableView: { default: null, type: cc.tableView },

        supplyData: { default: null },
        itemDatas: { default: [] },
        tabIndex: { default: 0 }
    },
    onEnable: function () {
        Game.NotificationController.On(Game.Define.EVENT_KEY.SUPPLYPREPARE_ACK, this, this.onPreClose);
        Game.NetWorkController.AddListener('msg.GW2C_AckTravelView', this, this.onAckTravelView);
        this.supplyData = Game._.cloneDeep(Game.TravelModel.supplyItems);
        this.itemDatas = [];
        for (let k in SupplyType) {
            this.itemDatas[SupplyType[k]] = Game.ItemModel.GetItemsByType(ItemType[SupplyType[k]]);
        }
        for (let i = 0; i < this.supplyData.length; i++) {
            let data = this.supplyData[i];
            if (data.itemid != 0) {
                let config = Game.ItemModel.GetItemConfig(data.itemid);
                let index = Game._.indexOf(ItemType, Game._.get(config, 'Type', -1));
                if (index != -1) {
                    let item = Game._.find(this.itemDatas[index], { itemid: data.itemid });
                    if (item != null) {
                        item.num += 1;
                    } else {
                        item = Game.ItemModel.CreateNewItem(data.itemid, 1);
                        this.itemDatas[index].push(item);
                    }
                }
            }
        }
        this.onSwitchTab(null, 1);
        this._updateSupplyView();
        Game.NetWorkController.Send('msg.C2GW_ReqTravelView', { open: true });
        if (Game.TravelModel.eventid != 0) {
            //有事件未查看
            Game.NetWorkController.Send('msg.C2GW_ReqCheckEvent', {})
            Game.TravelModel.SetOpenEvent(Game.TravelModel.eventid);
            this.openView(Game.UIName.UI_EVENTDETAILVIEW);
        }
    },
    onDisable: function () {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.SUPPLYPREPARE_ACK, this, this.onPreClose);
        Game.NetWorkController.RemoveListener('msg.GW2C_AckTravelView', this, this.onAckTravelView);
        Game.NetWorkController.Send('msg.C2GW_ReqTravelView', { open: false });
    },
    onSwitchTab: function (event, index) {
        this.tabIndex = index;
        for (let i = 0; i < this.tabButtons.length; i++) {
            let button = this.tabButtons[i];
            button.interactable = (i != index);
        }
        for (let i = 0; i < this.tabLabelNodes.length; i++) {
            let labelNode = this.tabLabelNodes[i];
            labelNode.color = (i == index ? TabSelectColor : TabNormalColor);
        }
        this.tableView.clear();
        this.tableView.initTableView(Math.max(24, this.itemDatas.length), { array: this.itemDatas[index], target: this, selectid: this.supplyData[index].itemid });
    },
    onConfirm: function () {
        Game.NetWorkController.Send('msg.C2GW_ReqPrepareTravel', { items: this.supplyData });
    },
    onPreClose: function () {
        Game.NetWorkController.Send('msg.C2GW_ReqTravelView', { open: false });
    },
    onAckTravelView: function (msgid, data) {
        if (!data.open) {
            this.onClose();
        }
    },
    onSupplyItemClick: function (index) {
        let items = this.itemDatas[this.tabIndex];
        let item = items[index];
        //点击了这个物品
        let supplyItem = this.supplyData[this.tabIndex];
        if (supplyItem.itemid == item.itemid) {
            //取消选择
            supplyItem.itemid = 0;
            supplyItem.num = 0;
        } else {
            //选择
            supplyItem.itemid = item.itemid;
            supplyItem.num = 1;
        }
        //更新物品吧
        this.tableView.getCells(function (cells) {
            for (let i = 0; i < cells.length; i++) {
                let cell = cells[i];
                let supplyItemNode = cell.getComponent('SupplyItemNode');
                let id = supplyItemNode.GetId()
                if (id != -1) {
                    id == supplyItem.itemid ? supplyItemNode.Select() : supplyItemNode.Unselect();
                }
            }
        }.bind(this));
        this._updateSupplyView();
    },
    _updateSupplyView: function () {
        for (let i = 0; i < 3; i++) {
            let iconSprite = this.supplyIconSprites[i];
            let detailLabel = this.supplyDetailLabels[i];
            let supplyItem = this.supplyData[i];
            if (supplyItem.itemid == 0) {
                iconSprite.spriteFrame = null;
                detailLabel.string = '';
            } else {
                let config = Game.ItemModel.GetItemConfig(supplyItem.itemid)
                Game.ResController.GetSpriteFrameByName(config.Itempath, function (err, res) {
                    if (!err) {
                        iconSprite.spriteFrame = res;
                    }
                });
                detailLabel.string = config.Desc;
            }
        }
    }
});
