const _ = require('lodash');

const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const ProtoMsg = require('../Util/ProtoMsg');

const ItemModel = require('../Model/Item');
const CurrencyModel = require('../Model/Currency');
const NetWorkController = require('./NetWorkController');
const NotificationController = require('./NotificationController');

let RewardController = function () {
    this._lastReward = null;
};
/**
 * 
 * @param {Function} cb 
 */
RewardController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_RewardNotify', this, this.onRewardNotify);
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
                case Define.MINIGAMETYPE.LINKUP:
                    return 'Image/GameScene/Minigame/button_memorycoin';
                case Define.MINIGAMETYPE.LUCKILY:
                    return 'Image/GameScene/Palace/button_sleep';
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

RewardController.prototype.onRewardNotify = function (msgid, data) {
    this._lastReward = data;
}
RewardController.prototype.GetLastReward = function () {
    return this._lastReward;
}
RewardController.prototype.PlayLastReward = function (cb) {
    let golds = _.get(this._lastReward, 'rewards.golds', []);
    let rewards = _.get(this._lastReward, 'rewards.rewards', []);
    let delay = 1;
    if (golds.length != 0) {
        NotificationController.Emit(Define.EVENT_KEY.TIP_PLAYGOLDFLY);
        CurrencyModel.AddGold(golds);
        NotificationController.Emit(Define.EVENT_KEY.TIP_REWARD, {
            info: '<color=#ed5b5b>金币+' + Tools.UnitConvert(golds) + '</c>',
            alive: 0.5,
            delay: 0.5,
        });
        delay = 1500;
    }
    let popinfo = [];
    for (let i = 0; i < rewards.length; i++) {
        let reward = rewards[i];
        switch (reward.rewardtype) {
            case ProtoMsg.msg.RewardType.Power:
                NetWorkController.Send('msg.C2GW_ReqPower');
                break;
            case ProtoMsg.msg.RewardType.MiniGameCoin:
                NetWorkController.Send('msg.C2GW_ReqMiniGameCoin');
                break;
            default:
                break;
        }
        let icon = this.GetRewardIcon(reward);
        if (icon != '') {
            popinfo.push({
                name: this.GetRewardName(reward),
                icon: icon,
                count: reward.rewardvalue
            });
        }
    }
    if (golds.length == 0 && popinfo.length == 0) {
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, '未获得任何奖励');
    }
    setTimeout(function () {
        if (popinfo.length > 0) {
            NotificationController.Emit(Define.EVENT_KEY.TIP_SERIESPOP, popinfo, cb);
        } else {
            Tools.InvokeCallback(cb);
        }
    }, delay);
}

module.exports = new RewardController();