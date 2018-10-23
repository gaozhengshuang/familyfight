const _ = require('lodash');

const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const ProtoMsg = require('../Util/ProtoMsg');

const ItemModel = require('../Model/Item');
const NetWorkController = require('./NetWorkController');
const NotificationController = require('./NotificationController');

let RewardController = function () {
};
/**
 * 
 * @param {Function} cb 
 */
RewardController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb, null);
};

RewardController.prototype.GetRewardName = function (data) {
    switch (data.rewardtype) {
        case ProtoMsg.msg.RewardType.BigGold:
            return '金币';
        case ProtoMsg.msg.RewardType.Power:
            return '体力';
        case ProtoMsg.msg.RewardType.Item:
            let itemConfig = ItemModel.GetItemConfig(data.rewardid);
            if (itemConfig != null) {
                return itemConfig.Name || '';
            } else {
                return '';
            }
        case ProtoMsg.msg.RewardType.Favor:
            return '亲密度'
        case ProtoMsg.msg.RewardType.MiniGameCoin:
            return Define.MINIGAMENAME[data.rewardid] || '';
        case ProtoMsg.msg.RewardType.MiniGame:
            return Define.ACTIVEGAMENAME[data.rewardid] || '';
        default:
            return '';
    }
}

RewardController.prototype.GetRewardIcon = function (data) {
    switch (data.rewardtype) {
        case ProtoMsg.msg.RewardType.BigGold:
            return 'Image/GameScene/Common/image_gold';
        case ProtoMsg.msg.RewardType.Power:
            return 'Image/GameScene/Common/image_powerIcon';
        case ProtoMsg.msg.RewardType.Item:
            let itemConfig = ItemModel.GetItemConfig(data.rewardid);
            if (itemConfig != null) {
                return itemConfig.Itempath || '';
            } else {
                return '';
            }
        case ProtoMsg.msg.RewardType.Favor:
            return 'Image/GameScene/Common/image_herat';
        case ProtoMsg.msg.RewardType.MiniGameCoin:
            switch (data.rewardid) {
                case Define.MINIGAMETYPE.TENSECOND:
                    return 'Image/GameScene/Minigame/button_tensecond';
                case Define.MINIGAMETYPE.KICKASS:
                    return 'Image/GameScene/Minigame/button_kickass';
                case Define.MINIGAMETYPE.TRYST:
                    return 'Image/GameScene/Palace/button_date';
                default:
                    return '';
            }
        case ProtoMsg.msg.RewardType.MiniGame:
            return '';
        default:
            return '';
    }
}

module.exports = new RewardController();