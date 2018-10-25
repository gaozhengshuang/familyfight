let Game = require('../../Game');
let LinkItemNode = require('../Node/LinkItemNode');

const LinkStatus = {
    Status_Idle: 1,
    Status_Wait: 2,
    Status_Judge: 3,
    Status_End: 4,
}
const GameTime = 30;
const WrongShowTime = 0.3;
cc.Class({
    extends: cc.GameComponent,

    properties: {
        linkItemNodes: { default: [], type: [LinkItemNode] },
        maskNode: { default: null, type: cc.Node },
        countDownLabel: { default: null, type: cc.Label },
        rewardTimesLabel: { default: null, type: cc.Label },

        linkInfos: { default: [] },
        status: { default: 0 },
        startTime: { default: 0 },
        firstItem: { default: null },
        secondItem: { default: null },
        matchInfos: { default: [] }
    },
    onLoad() {
        Game.NetWorkController.AddListener('msg.GW2C_RetLinkup', this, this.onRetLinkup);
    },
    onEnable: function () {
        this._changeStatus(LinkStatus.Status_Idle);
    },
    update(dt) {
        if (this.status != LinkStatus.Status_Idle && this.status != LinkStatus.Status_End) {
            //倒计时
            let lastTime = GameTime - (Game.TimeController.GetCurTime() - this.startTime);
            if (lastTime >= 0) {
                this.countDownLabel.string = Game.moment.unix(lastTime).format('mm:ss');
                this.rewardTimesLabel.string = 'x 2倍';
            } else {
                this.countDownLabel.string = '';
                this.rewardTimesLabel.string = 'x 1倍';
            }
            // if (lastTime <= 0) {
            //     this._changeStatus(LinkStatus.Status_End);
            // }
        }
    },
    onDestroy: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_RetLinkup', this, this.onRetLinkup);
    },
    onStartClick: function () {
        if (this.status == LinkStatus.Status_Idle) {
            if (Game.CurrencyModel.GetMiniGameCoin(Game.Define.MINIGAMETYPE.LINKUP) < 1) {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_TIPS, '小游戏币不足');
                return;
            }
            this.maskNode.active = false;
            this.startTime = Game.TimeController.GetCurTime();
            this._changeStatus(LinkStatus.Status_Wait);
        }
    },
    onLinkItemClick: function (index) {
        if (this.status == LinkStatus.Status_Wait) {
            let matchedIds = Game._.reduce(this.matchInfos, function (result, other) {
                return result.concat(other);
            }, []);
            if (Game._.indexOf(matchedIds, index) != -1) {
                //选中的列表中已经有咯
                console.log('选中的列表中已经有咯');
                return;
            }
            let linkItem = this.linkItemNodes[index];
            if (this.firstItem == linkItem || this.secondItem == linkItem) {
                //正在匹配了
                console.log('正在匹配了');
                return;
            }
            //这个状态才相应哦
            if (this.firstItem == null) {
                //第一个反过来的
                this.firstItem = linkItem;
                this.firstItem.TurnFrontWithAnima(0, 0.6);
            } else if (this.secondItem == null) {
                //第二个翻过来的
                this.secondItem = linkItem;
                this._changeStatus(LinkStatus.Status_Judge);
                this.secondItem.TurnFrontWithAnima(0, 0.6, function () {
                    //都反过来了
                    if (this.firstItem.value == this.secondItem.value) {
                        //选对咯
                        this.firstItem.SetOpacity(100);
                        this.secondItem.SetOpacity(100);
                        this.matchInfos.push([this.firstItem.index, this.secondItem.index]);
                        this.firstItem = null;
                        this.secondItem = null;
                        this._changeStatus(LinkStatus.Status_Wait);

                        //看看选美选齐全
                        if (this.matchInfos.length >= 6) {
                            //全了 TODO
                            this._changeStatus(LinkStatus.Status_End);
                        }
                    } else {
                        //选错了 翻回去
                        this.firstItem.TurnBackWithAnima(WrongShowTime, 0.6);
                        this.secondItem.TurnBackWithAnima(WrongShowTime, 0.6, function () {
                            this._changeStatus(LinkStatus.Status_Wait);
                            this.firstItem = null;
                            this.secondItem = null;
                        }.bind(this));
                    }
                }.bind(this));
            }
        }
    },
    onRetLinkup: function (msgid, data) {
        if (data.result == 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                info: '<color=#6d282d>获得金币+<color=#ed5b5b>' + Game.Tools.UnitConvert(data.gold) + '</c></c>',
                alive: 0.5,
                delay: 1
            });
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_PLAYGOLDFLY);
            Game.CurrencyModel.AddGold(data.gold);
        }
        this.node.runAction(cc.sequence([
            cc.delayTime(2),
            cc.callFunc(function () {
                this._changeStatus(LinkStatus.Status_Idle);
            }, this)
        ]))
    },
    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case LinkStatus.Status_Idle:
                    for (let i = 0; i < this.linkItemNodes.length; i++) {
                        let view = this.linkItemNodes[i];
                        view.StopAllAction();
                        view.SetOpacity(255);
                        view.TurnBackWithAnima(0, 0.0);
                    }
                    this.maskNode.active = true;
                    this.firstItem = null;
                    this.secondItem = null;
                    this.matchInfos = [];
                    this._randomItem();
                    this.countDownLabel.string = '';
                    break;
                case LinkStatus.Status_Wait:
                    break;
                case LinkStatus.Status_Judge:
                    break;
                case LinkStatus.Status_End:
                    //计算奖励金币
                    let lastTime = GameTime - (Game.TimeController.GetCurTime() - this.startTime);
                    Game.NetWorkController.Send('msg.C2GW_ReqLinkup', { score: this.matchInfos.length * (lastTime > 0 ? 2 : 1) })
                    // this.closeView(Game.UIName.UI_LINKUP);
                    break;
                default:
                    break;
            }
        }
    },
    _randomItem: function () {
        this.linkInfos = Game._.shuffle([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
        for (let i = 0; i < this.linkItemNodes.length; i++) {
            let item = this.linkItemNodes[i];
            item.TurnBackWithAnima(0, 0.0);
            item.Init(i, this.linkInfos[i], this.onLinkItemClick.bind(this));
        }
    }
});
