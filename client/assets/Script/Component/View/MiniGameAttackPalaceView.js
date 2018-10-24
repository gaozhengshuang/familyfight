const Game = require('../../Game');
const AttackStatus = {
    Status_Idle: 1,
    Status_Prepared: 2,
    Status_Fight: 3,
    Status_End: 4,
};
const PreAttackDialogues = [
    '居然敢动朕的人',
    '敢闯入朕的后宫'
];
const AttackedDialogues = [
    '好你个大猪蹄子',
    '爱是一道光，绿的朕发慌'
];
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

        status: { default: 0 },
        palacedata: { default: null }
    },
    onEnable: function () {
        Game.NetWorkController.AddListener('msg.GW2C_AckAttackPalaceData', this, this.onAckAttackPalaceData);
        this._changeStatus(AttackStatus.Status_Idle);
    },
    onDisable: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckAttackPalaceData', this, this.onAckAttackPalaceData);
    },
    onAckAttackPalaceData: function (msgid, data) {
        if (this.status == AttackStatus.Status_Idle) {
            this.palacedata = data.data;
            this._changeStatus(AttackStatus.Status_Prepared);
        }
    },
    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case AttackStatus.Status_Idle: {
                    this.image_master.node.active = false;
                    this.image_player.spriteFrame = null;
                    this.label_playername.string = '';
                    this.label_dialogue.string = PreAttackDialogues[Game.Tools.GetRandomInt(0, PreAttackDialogues.length)];
                    for (let i = 0; i < this.images_maid.length; i++) {
                        let maid = this.images_maid[i];
                        maid.spriteFrame = null;
                    }
                    this.node_ruletip.active = true;
                    this.node_gettips.active = false;
                    Game.NetWorkController.Send('msg.C2GW_ReqAttackPalaceData', {});
                    break;
                }
                case AttackStatus.Status_Prepared: {
                    this.image_master.node.active = true;
                    let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this.palacedata.id);
                    this.image_player.spriteFrame = null;
                    this.label_playername.string = '';
                    for (let i = 0; i < this.images_maid.length; i++) {
                        let maid = this.images_maid[i];
                        maid.spriteFrame = null;
                    }
                    this.node_ruletip.active = true;
                    this.node_gettips.active = false;
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
