const Game = require('../../Game');
const AttackStatus = {
    Status_Idle: 1,
    Status_Prepared: 2,
    Status_WaitAttack: 3,
    Status_Attack: 4,
    Status_End: 5,
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
    extends: cc.GameComponent,
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
        node_aim: { default: null, type: cc.Node },
        node_tip: { default: null, type: cc.Node },
        anima_attack: { default: null, type: cc.Animation },
        anima_show: { default: null, type: cc.Animation },
        anima_dialogue: { default: null, type: cc.Animation },
        widgetNode: { default: null, type: cc.Node },

        status: { default: 0 },
        palacedata: { default: null },
        clickIndex: { default: 0 }
    },
    onLoad: function () {
        let viewSize = cc.view.getVisibleSize();
        this.widgetNode.width = viewSize.width;
        this.widgetNode.height = viewSize.height;
    },
    onEnable: function () {
        let viewSize = cc.view.getVisibleSize()
        let height = this.node_tip.height;
        this.node_tip.y = -(viewSize.height / 2) - (height / 2);
        Game.NetWorkController.AddListener('msg.GW2C_AckAttackPalaceData', this, this.onAckAttackPalaceData);
        Game.NetWorkController.AddListener('msg.GW2C_AckAttackPalace', this, this.onAckAttackPalace);
        this.anima_attack.on('stop', this.onAttackPlayEnd, this);
        this.anima_show.on('stop', this.onShowPlayEnd, this);
        this.anima_dialogue.node.scaleX = 0;
        this.anima_dialogue.node.scaleY = 0;
        this._changeStatus(AttackStatus.Status_Idle);
        this.anima_show.play();
        Game.AudioController.PlayMusic('Audio/bg1');
    },
    onDisable: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckAttackPalaceData', this, this.onAckAttackPalaceData);
        Game.NetWorkController.RemoveListener('msg.GW2C_AckAttackPalace', this, this.onAckAttackPalace);
        this.anima_attack.off('stop', this.onAttackPlayEnd, this);
        this.anima_show.off('stop', this.onShowPlayEnd, this);
        Game.AudioController.StopMusic();
    },
    onAckAttackPalaceData: function (msgid, data) {
        if (this.status == AttackStatus.Status_Idle) {
            this.palacedata = data.data;
            this._changeStatus(AttackStatus.Status_Prepared);
        }
    },
    onAckAttackPalace: function (msgid, data) {
        if (data.result == 0 && this.status == AttackStatus.Status_WaitAttack) {
            this._changeStatus(AttackStatus.Status_Attack);
        }
    },
    onAttackPlayEnd: function () {
        let golds = Game._.get(Game.RewardController.GetLastReward(), 'rewards.golds', []);
        this.node_ruletip.active = false;
        this.node_gettips.active = true;
        this.label_golds.string = Game.Tools.UnitConvert(golds);
        this._playTipAnima();
        Game.RewardController.PlayLastReward(function () {
            this._changeStatus(AttackStatus.Status_End);
        }.bind(this));
    },
    onShowPlayEnd: function () {
        this.anima_dialogue.play();
        this._playTipAnima();
    },
    onMaidClick: function (event, index) {
        if (this.status == AttackStatus.Status_Prepared) {
            this.clickIndex = index;
            Game.NetWorkController.Send('msg.C2GW_ReqAttackPalace', { id: this.palacedata.id });
            this._changeStatus(AttackStatus.Status_WaitAttack);
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
                    this.node_aim.opacity = 0
                    Game.NetWorkController.Send('msg.C2GW_ReqAttackPalaceData', {});
                    break;
                }
                case AttackStatus.Status_Prepared: {
                    this.image_master.node.active = true;
                    let palaceMapBase = Game.ConfigController.GetConfigById("PalaceMap", this.palacedata.palace.id);
                    if (palaceMapBase) {
                        let maidBase = Game.ConfigController.GetConfigById("PalacePersonnel", palaceMapBase.Master);
                        if (maidBase) {
                            this.label_master.string = maidBase.Name;
                            Game.ResController.SetSprite(this.image_master, maidBase.Path);
                        }
                        let masterLvUpBase = Game.PalaceModel.GetPalaceMasterLvUpBase(palaceMapBase.Master, this.palacedata.palace.level);  //主人升级相关
                        this.label_title.string = '(' + masterLvUpBase.levelName + ')';
                        for (let i = 0; i < palaceMapBase.Maids.length; i++) {
                            let open = this.palacedata.palace.maids[i] || false;
                            let maidSprite = this.images_maid[i];
                            if (maidSprite != null) {
                                if (open) {
                                    let maidId = palaceMapBase.Maids[i];
                                    let curMaidBase = Game.ConfigController.GetConfigById("PalacePersonnel", maidId);
                                    Game.ResController.SetSprite(maidSprite, curMaidBase.Path);
                                    maidSprite.node.active = true;
                                } else {
                                    maidSprite.node.active = false;
                                }
                            }
                        }

                    }
                    // if (this.palacedata.face != '') {
                    //     Game.ResController.SetSprite(this.image_player, this.palacedata.face);
                    // }
                    Game.ResController.RandomHead(function (err, res) {
                        if (err) {
                            console.error('[严重错误] 加载资源失败 ' + err);
                        } else {
                            this.image_player.spriteFrame = res;
                        }
                    }.bind(this));
                    this.label_playername.string = this.palacedata.name;
                    this.label_targetname.string = this.palacedata.name;
                    break;
                }
                case AttackStatus.Status_WaitAttack: {
                    //等待回消息
                    break;
                }
                case AttackStatus.Status_Attack: {
                    //播动画
                    //
                    this.label_dialogue.string = AttackedDialogues[Game.Tools.GetRandomInt(0, AttackedDialogues.length)];
                    this.anima_dialogue.play();
                    let maid = this.images_maid[this.clickIndex];
                    let worldPos = maid.node.parent.convertToWorldSpaceAR(maid.node.position);
                    let aimtargetPos = this.node_aim.parent.convertToNodeSpaceAR(worldPos);
                    let animaPos = this.anima_attack.node.parent.convertToNodeSpaceAR(worldPos);
                    this.node_aim.position = aimtargetPos;
                    this.anima_attack.node.position = animaPos;
                    this.node_aim.scaleX = 1.2;
                    this.node_aim.scaleY = 1.2;
                    this.node_aim.runAction(cc.sequence([
                        cc.spawn([
                            cc.fadeTo(0.5, 255),
                            cc.scaleTo(0.5, 0.9),
                        ]),
                        cc.scaleTo(0.3, 1.1),
                        cc.scaleTo(0.1, 1),
                        cc.callFunc(function () {
                            this.node_aim.opacity = 0;
                            this.anima_attack.play('AttackPalace');

                        }, this)
                    ]));
                    break;
                }
                case AttackStatus.Status_End: {
                    this.onClose();
                    break;
                }
                default:
                    break;
            }
        }
    },
    _playTipAnima: function () {
        let viewSize = cc.view.getVisibleSize()
        let height = this.node_tip.height;
        this.node_tip.y = -(viewSize.height / 2) - (height / 2);
        this.node_tip.runAction(cc.moveBy(0.5, 0, height));
    }
});
