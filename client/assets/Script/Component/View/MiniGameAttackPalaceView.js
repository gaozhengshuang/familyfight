const Game = require('../../Game');
const AttackStatus = {
    Status_Idle: 1,
    Status_Prepared: 2,
    Status_Fight: 3,
    Status_End: 4,
};
cc.Class({
    extends: cc.Component,
    properties: {
        image_master: { default: null, type: cc.Sprite },
        label_master: { default: null, type: cc.Label },
        label_title: { default: null, type: cc.Label },
        image_player: { default: null, type: cc.Sprite },
        label_playername: { default: null, type: cc.Label },
        label_dialogue: { default: null, type: cc.Label },
        images_maid: { default: [], type: [cc.Sprite] },
        node_ruletip: { default: null, type: cc.Node },
        node_gettips: { default: null, type: cc.Node },
        label_targetname: { default: null, type: cc.Label },
        label_golds: { default: null, type: cc.Label },

        status: { default: AttackStatus.Status_Idle }
    },
    onEnable: function () {

    },
    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case AttackStatus.Status_Idle: {
                    break;
                }
                case AttackStatus.Status_Prepared: {
                    break;
                }
                case AttackStatus.Status_Fight: {
                    break;
                }
                case AttackStatus.Status_End: {
                    break;
                }
                default:
                    break;
            }
        }
    },
});
