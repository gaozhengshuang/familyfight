const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const NotificationController = require('./NotificationController');
const TurnGameDefine = require('../Util/TurnGameDefine');
const NetWorkController = require('../Controller/NetWorkController');

var GameController = function () {
    this.state = TurnGameDefine.GAME_STATE.STATE_PREPARING;
    this.dialoguePrefab = null;
}

GameController.prototype.Init = function (cb) {
    NetWorkController.AddListener('msg.GW2C_MsgNotify', this, this.onGW2C_MsgNotify);
    cc.loader.loadRes("Prefab/DialogueNode", function (err, prefab) {
        if (err) {
            Tools.InvokeCallback(cb, '[严重错误] 奖励资源加载错误 ' + err);
        } else {
            this.dialoguePrefab = prefab;
            Tools.InvokeCallback(cb, null);
        }
    }.bind(this));

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

GameController.prototype.ShowDialogue = function (parent, id) {
    let node = cc.instantiate(this.dialoguePrefab);
    let dialogView = node.getComponent('DialogView');
    parent.addChild(node);
    dialogView.Init(id);
}
/**
 * 消息处理接口
 */
GameController.prototype.onGW2C_MsgNotify = function (msgid, data) {
    NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, data);
}

module.exports = new GameController();