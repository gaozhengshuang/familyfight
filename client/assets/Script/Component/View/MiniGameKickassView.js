const Game = require('../../Game');
const KickAssStatus = {
    Status_Idle: 1,
    Status_Moving: 2,
    Status_Kick: 3,
    Status_Settlement: 4,
    Status_End: 5
}
const EunuchMoveX = 280;
const EunuchSpeed = 600;
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
        actionButtonNode: { default: null, type: cc.Node },
        aimNode: { default: null, type: cc.Node },
        reddotNode: { default: null, type: cc.Node },
        rewardLabel: { default: null, type: cc.Label },
        coinLabel: { default: null, type: cc.Label },

        status: { default: KickAssStatus.Status_Idle },
        speed: { default: EunuchSpeed }
    },
    onLoad: function () {
        Game.NetWorkController.AddListener('msg.GW2C_AckKickAss', this, this.onAckKickAss);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },
    update: function (dt) {
        if (this.status == KickAssStatus.Status_Moving || this.status == KickAssStatus.Status_Kick) {
            let addition = this.speed * dt;
            let targetx = this.eunuchNode.x + addition;
            if (targetx < -EunuchMoveX) {
                //要到右边了
                this.speed = EunuchSpeed;
                this.eunuchNode.x = -EunuchMoveX;
            } else if (targetx > EunuchMoveX) {
                this.speed = -EunuchSpeed;
                this.eunuchNode.x = EunuchMoveX;
            } else {
                this.eunuchNode.x = targetx;
            }
        }
    },
    onEnable: function () {
        this._changeStatus(KickAssStatus.Status_Idle);
        let allincomenum = Game.Tools.toBigIntMoney(Game.MaidModel.GetMoneyMaids()).multiply(Game.ConfigController.GetConfig('KickAssWinReward').Gold);
        this.rewardLabel.string = Game.Tools.UnitConvert(Game.Tools.toLocalMoney(allincomenum));
        this.updateMiniGameCoin();
    },
    onDestroy: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckKickAss', this, this.onAckKickAss);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },
    onAckKickAss: function (msgid, data) {
        if (this.status == KickAssStatus.Status_Settlement) {
            this.shoeNode.runAction(cc.sequence([
                cc.moveTo(KickInterval, 0, ShoeInitY),
                cc.callFunc(function () {
                    this._changeStatus(KickAssStatus.Status_End);
                }, this)
            ]));
        }
        if (data.result == 0) {
            //加金币
            Game.CurrencyModel.AddGold(data.gold);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                info: '<color=#6d282d>获得金币+<color=#ed5b5b>' + Game.Tools.UnitConvert(data.gold) + '</c></c>',
                alive: 0.5,
                delay: 1
            });
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_PLAYGOLDFLY);
        }
    },
    onActionClick: function () {
        switch (this.status) {
            case KickAssStatus.Status_Idle:
                if (Game.CurrencyModel.GetPower() < 1) {
                    this.showTips("体力不足");
                    return;
                }
                this._changeStatus(KickAssStatus.Status_Moving);
                break;
            case KickAssStatus.Status_Moving:
                this._changeStatus(KickAssStatus.Status_Kick);
                break;
            case KickAssStatus.Status_End:
                if (Game.CurrencyModel.GetPower() < 1) {
                    this.showTips("体力不足");
                    return;
                }
                this._changeStatus(KickAssStatus.Status_Moving);
                break;
        }
    },
    onGoBackClick: function () {
        this.closeView(Game.UIName.UI_MINIGAMEKICKASS);
    },
    updateMiniGameCoin: function () {
        this.coinLabel.string = '剩余次数:' + Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.TENSECOND);
    },
    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case KickAssStatus.Status_Idle:
                    this.tipNode.active = true;
                    this.actionButtonLabel.string = '开始';
                    this.backButtonNode.active = true;
                    this.eunuchNode.x = 0;
                    this.shoeNode.y = ShoeInitY;
                    this.actionButtonNode.active = true;
                    break;
                case KickAssStatus.Status_Moving:
                    this.tipNode.active = false;
                    this.actionButtonLabel.string = '踢他';
                    this.backButtonNode.active = false;
                    this.shoeNode.y = ShoeInitY;
                    this.actionButtonNode.active = true;
                    break;
                case KickAssStatus.Status_Kick:
                    this.tipNode.active = false;
                    this.actionButtonNode.active = false;
                    this.backButtonNode.active = false;
                    this.shoeNode.runAction(cc.sequence([
                        cc.moveTo(KickInterval, this.aimNode.position),
                        cc.callFunc(function () {
                            this._changeStatus(KickAssStatus.Status_Settlement)
                        }, this)
                    ]));
                    break;
                case KickAssStatus.Status_Settlement:
                    this.tipNode.active = false;
                    this.actionButtonNode.active = false;
                    this.backButtonNode.active = false;
                    //发消息
                    let box = this.reddotNode.getBoundingBoxToWorld();
                    let pos = this.aimNode.parent.convertToWorldSpaceAR(this.aimNode.position);
                    let hit = box.contains(pos);
                    Game.NetWorkController.Send('msg.C2GW_ReqKickAss', { hit: hit });
                    break;
                case KickAssStatus.Status_End:
                    this.tipNode.active = false;
                    this.actionButtonNode.active = true;
                    this.actionButtonLabel.string = '再来一次';
                    this.shoeNode.y = ShoeInitY;
                    this.backButtonNode.active = true;
                default:
                    break;
            }
        }
    },
});
