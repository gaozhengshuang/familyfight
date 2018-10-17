const Game = require('../../Game');
const KickAssStatus = {
    Status_Idle: 1,
    Status_Moving: 2,
    Status_Kick: 3,
    Status_End: 4,
}
const EunuchMoveX = 280;
const EunuchSpeed = 100;
const KickInterval = 0.5;
const ShoeInitY = -220;

cc.Class({
    extends: cc.GameComponent,

    properties: {
        backButtonNode: { default: null, type: cc.Node },
        eunuchNode: { default: null, type: cc.Node },
        tipNode: { default: null, type: cc.Node },
        shoeNode: { default: null, type: cc.Node },
        actionButtonLabel: { default: null, type: cc.Label },

        status: { default: KickAssStatus.Status_Idle }
    },
    onLoad: function () {
        Game.NetWorkController.AddListener('msg.GW2C_AckKickAss', this, this.onAckKickAss);
    },
    onAckKickAss: function (msgid, data) {

    }
});
