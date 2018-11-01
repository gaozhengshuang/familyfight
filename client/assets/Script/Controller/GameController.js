const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const NotificationController = require('./NotificationController');
const TurnGameDefine = require('../Util/TurnGameDefine');
const NetWorkController = require('./NetWorkController');
const ConfigController = require('./ConfigController');
const ActiveController = require('./ActiveController');

var GameController = function () {
    this.state = TurnGameDefine.GAME_STATE.STATE_PREPARING;
    this.dialoguePrefab = null;
}

GameController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_MsgNotify', this, this.onGW2C_MsgNotify);
    NotificationController.On(Define.EVENT_KEY.ON_SHOWGAME, this, this.onShowGame);
    Tools.InvokeCallback(cb, null);
}

GameController.prototype.RestartRound = function () {
}

GameController.prototype.ChangeState = function (state) {
    if (this.state == state) {
        return;
    }
    this.state = state;
    NotificationController.Emit(Define.EVENT_KEY.CHANGE_GAMESTATE, state);
}

/**
 * 消息处理接口
 */
GameController.prototype.onGW2C_MsgNotify = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, data);
}

GameController.prototype.onShowGame = function (res) {
    if (ActiveController._sharing) {
        //分享回来了
        ActiveController._sharing = false;
        if (ActiveController.GetLastShareRewardTimes(ActiveController._sharetype, ActiveController._shareid, ActiveController._sharetime) > 0) {
            //有奖励领取哦 才发送
            NetWorkController.Send('msg.C2GW_ReqShareMessage', {
                sharetype: ActiveController._sharetype,
                id: ActiveController._shareid,
                time: ActiveController._sharetime
            })
        }
    }
    // let query = _.get(res, 'query', {});
    // if (query != null && query.sharetype != null && query.shareid != null && query.time != null) {
    //     //通过点击分享卡片进入
    // }
}

module.exports = new GameController();