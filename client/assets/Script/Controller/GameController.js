import Define from '../Util/Define';
import TurnGameDefine from '../Util/TurnGameDefine';
import Tools from '../Util/Tools';

import NotificationController from '../Controller/NotificationController';
import NetWorkController from '../Controller/NetWorkController';

var GameController = function () {
    this.state = TurnGameDefine.GAME_STATE.STATE_PREPARING;
}

GameController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_MsgNotify', this, this.onGW2C_MsgNotify);

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

module.exports = new GameController();