let Game = require('../../Game');
let BrandItemView = require('./BrandItemView');

const BrandStatus = {
    Status_Idle: 1,                 //初始化
    Status_Preparing: 2,            //准备翻牌动画
    Status_Wait: 3,                 //等待点击
    Status_Shaking: 4,              //抖动 等待服务器返回
    Status_ShakeEnd: 5,             //至少抖动一次完了
    Status_Show: 6                  //服务器返回 展示奖励
}

const MiniGameId = {
    1: Game.UIName.UI_LINKUP
}
const MiniGameName = {
    1: '记忆翻牌'
}

const TurnTimeDiff = 0.1;
const TurnDelay = 0.6;
const MoveDelay = 0.2;

cc.Class({
    extends: cc.GameComponent,
    properties: {
        brandViews: { default: [], type: [BrandItemView] },
        shuffleTargetNode: { default: null, type: cc.Node },
        showTargetNode: { default: null, type: cc.Node },
        dialogueNode: { default: null, type: cc.Node },
        miniGameCoinLabel: { default: [], type: [cc.Label] },

        status: { default: BrandStatus.Status_Idle },
        brandInfos: { default: [] },
        brandConfigs: { default: [] },
        shuffleTargetWorldPos: { default: cc.v2(0, 0) },
        showTargetWorldPos: { default: cc.v2(0, 0) },
        clickIndex: { default: 0 },
        rewardId: { default: 0 },
        drop: { default: null }
    },
    onLoad: function () {
        this.brandConfigs = Game.ConfigController.GetConfig('TurnBrand');
        this.shuffleTargetWorldPos = this.shuffleTargetNode.parent.convertToWorldSpaceAR(this.shuffleTargetNode.position);
        this.showTargetWorldPos = this.showTargetNode.parent.convertToWorldSpaceAR(this.showTargetNode.position);
        for (let i = 0; i < this.brandViews.length; i++) {
            let view = this.brandViews[i];
            view.TurnBackWithAnima(0.0);
        }
        Game.NetWorkController.AddListener('msg.GW2C_RetTurnBrand', this, this.onRetTurnBrand);
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },
    onEnable: function () {
        for (let i = 0; i < this.brandViews.length; i++) {
            let view = this.brandViews[i];
            view.StopAllAction();
        }
        this.status = 0;
        this._randBrandInfo();
        this.updateMiniGameCoin();
    },
    update: function (dt) {
    },
    onDestroy: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_RetTurnBrand', this, this.onRetTurnBrand);
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEMINIGAMECOIN, this, this.updateMiniGameCoin);
    },
    onDisable: function () {
        this.node.stopAllActions();
    },
    onBrandClick: function (index) {
        if (this.status == BrandStatus.Status_Wait) {
            if (Game.CurrencyModel.GetPower() < 1) {
                this.showTips("体力不足");
                return;
            }
            this.clickIndex = index;
            this.rewardId = 0;
            //其他状态不响应哦
            Game.NetWorkController.Send('msg.C2GW_ReqTurnBrand', { ids: Game.GuideController.IsGuide() ? [5, 5, 5, 5, 5, 5] : Game._.map(this.brandInfos, 'Id'), level: Game.MaidModel.GetCurPass() }, function () {
                this._changeStatus(BrandStatus.Status_Shaking);
            }.bind(this));
            Game.GuideController.NextGuide();
        }
    },
    onGoBackClick: function () {
        Game.GuideController.NextGuide();
        this.closeView(Game.UIName.UI_TURNBRAND);
    },
    onRetTurnBrand: function (msgid, data) {
        if (data.result != 0) {
            //出错了
        }
        else {
            this.rewardId = data.id;
            this.drop = data.drop || {};
            this.drop.golds = this.drop.golds || [];
            this.drop.rewards = this.drop.rewards || [];
            let config = Game._.find(this.brandConfigs, { Id: this.rewardId });
            let view = this.brandViews[this.clickIndex];
            view.Init(this.clickIndex, config.Head, config.Name, this.onBrandClick.bind(this));
            if (this.status == BrandStatus.Status_ShakeEnd) {
                view.StopAllAction();
                //播放咯
                this._changeStatus(BrandStatus.Status_Show);
            }
        }
    },
    onShakeEnd: function () {
        if (this.status == BrandStatus.Status_Shaking) {
            this._changeStatus(BrandStatus.Status_ShakeEnd)
        }
    },
    updateMiniGameCoin: function () {
        for (let i = 0; i < this.miniGameCoinLabel.length; i++) {
            let label = this.miniGameCoinLabel[i];
            let times = Game.CurrencyModel.GetMiniGameCoin(i);
            label.string = (times == 0 ? '' : (times + '次'));
        }
    },
    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case BrandStatus.Status_Idle:
                    break;
                case BrandStatus.Status_Preparing:
                    this._initBrands();
                    break;
                case BrandStatus.Status_Wait:
                    break;
                case BrandStatus.Status_Shaking:
                    let view = this.brandViews[this.clickIndex];
                    view.ShakeForever(this.onShakeEnd.bind(this))
                    break;
                case BrandStatus.Status_ShakeEnd:
                    if (this.rewardId != 0) {
                        //有结果了
                        let view = this.brandViews[this.clickIndex];
                        view.StopAllAction();
                        //播放咯
                        this._changeStatus(BrandStatus.Status_Show);
                    }
                    break;
                case BrandStatus.Status_Show:
                    let showBrand = this.brandViews[this.clickIndex];
                    let targetPos = showBrand.node.parent.convertToNodeSpaceAR(this.showTargetWorldPos);
                    showBrand.node.runAction(cc.sequence([
                        cc.spawn([
                            cc.moveTo(0.5, targetPos),
                            cc.scaleTo(0.5, 1, 1),
                        ]),
                        cc.callFunc(function () {
                            showBrand.TurnFrontWithAnima(0.5);
                        }),
                        cc.delayTime(0.5),
                        cc.callFunc(this._showReward, this)
                    ]));
                    break;
                default:
                    break;
            }
        }
    },
    _randBrandInfo: function () {
        //后面要改成服务端记录 ？
        this.brandInfos = Game._.sampleSize(this.brandConfigs, 6);
        if (this.brandInfos.length == 6) {
            this._changeStatus(BrandStatus.Status_Preparing);
        } else {
            this.showTips("牌子不足6个");
        }
    },
    _initBrands: function () {
        let maxDuration = 0;
        // for (let i = 0; i < this.brandViews.length; i++) {
        //     let view = this.brandViews[i];
        //     view.node.position = cc.v2(0, 0);
        //     view.node.scaleX = 0.5;
        //     view.node.scaleY = 0.5;
        //     view.TurnFrontWithAnima(0.0);
        //     let info = this.brandInfos[i];
        //     view.Init(i, info.Head, info.Name, this.onBrandClick.bind(this));
        //     let targetPos = view.node.parent.convertToNodeSpaceAR(this.shuffleTargetWorldPos);
        //     let action = cc.sequence([
        //         cc.delayTime(i * TurnTimeDiff + 1),
        //         cc.callFunc(function () {
        //             view.TurnBackWithAnima(TurnDelay)
        //         }),
        //         cc.delayTime(TurnDelay),
        //         cc.delayTime((this.brandViews.length - i) * TurnTimeDiff),
        //         cc.moveTo(MoveDelay, targetPos),
        //         cc.moveTo(MoveDelay, 0, 0),
        //     ]);
        //     if (action.getDuration() > maxDuration) {
        //         maxDuration = action.getDuration();
        //     }
        //     view.node.runAction(action);
        // }
        for (let i = 0; i < this.brandViews.length; i++) {
            let view = this.brandViews[i];
            view.node.position = cc.v2(0, -600);
            view.node.scaleX = 0.5;
            view.node.scaleY = 0.5;
            view.node.opacity = 255;
            view.TurnBackWithAnima(0.0);
            let info = this.brandInfos[i];
            view.Init(i, info.Head, info.Name, this.onBrandClick.bind(this));
            let action = cc.sequence([
                cc.delayTime(i * TurnTimeDiff),
                cc.moveTo(MoveDelay, 0, 0),
            ]);
            if (action.getDuration() > maxDuration) {
                maxDuration = action.getDuration();
            }
            view.node.runAction(action);
        }

        this.node.runAction(cc.sequence([
            cc.delayTime(maxDuration + 0.1),
            cc.callFunc(function () {
                this._changeStatus(BrandStatus.Status_Wait)
            }, this)
        ]))
    },
    _hideBrands: function () {
        for (let i = 0; i < this.brandViews.length; i++) {
            let view = this.brandViews[i];
            let action = cc.sequence([
                cc.delayTime(0.1),
                i == this.clickIndex ?
                    cc.fadeOut(MoveDelay) :
                    cc.moveTo(MoveDelay, view.node.x, -600),
            ]);
            view.node.runAction(action);
        }
    },
    _showReward: function () {
        let config = Game._.find(this.brandConfigs, { Id: this.rewardId });
        let notifyIndex = 0;
        if (this.drop.golds.length != 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_PLAYGOLDFLY);
            Game.CurrencyModel.AddGold(this.drop.golds);
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                info: '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】获得<color=#ed5b5b>金币+' + Game.Tools.UnitConvert(this.drop.golds) + '</c></c>',
                alive: 0.5,
                delay: 0.5,
                timeout: 0.8 * notifyIndex
            });
            notifyIndex++;
        }
        let minigame = -1;
        let popinfo = [];
        for (let i = 0; i < this.drop.rewards.length; i++) {
            // Game.ProtoMsg.RewardType.BigGold
            let reward = this.drop.rewards[i];
            let info = '';
            switch (reward.rewardtype) {
                case Game.ProtoMsg.msg.RewardType.Power:
                    Game.NetWorkController.Send('msg.C2GW_ReqPower');
                    info = '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】获得<color=#ed5b5b>体力+' + reward.rewardvalue + '</c></c>';
                    break;
                case Game.ProtoMsg.msg.RewardType.MiniGameCoin:
                    Game.NetWorkController.Send('msg.C2GW_ReqMiniGameCoin');
                case Game.ProtoMsg.msg.RewardType.Favor:
                case Game.ProtoMsg.msg.RewardType.Item:
                    popinfo.push({
                        name: Game.RewardController.GetRewardName(reward),
                        icon: Game.RewardController.GetRewardIcon(reward),
                        count: reward.rewardvalue
                    });
                    break;
                case Game.ProtoMsg.msg.RewardType.MiniGame:
                    minigame = reward.rewardid;
                    info = '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】前去-<color=#ed5b5b>' + Game.Define.ACTIVEGAMENAME[reward.rewardid] + '</c></c>';
                    break;
                default:
                    break;
            }
            if (info != '') {
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                    info: info,
                    alive: 0.5,
                    delay: 0.5,
                    timeout: 0.8 * notifyIndex
                });
                notifyIndex++;
            }
        }
        if (popinfo.length > 0) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_SERIESPOP, popinfo);
        }
        this.node.runAction(cc.sequence([
            cc.delayTime(0.5),
            cc.callFunc(function () {
                this._hideBrands();
            }, this),
            cc.delayTime(1.2),
            cc.callFunc(function () {
                Game.GuideController.NextGuide();
                if (minigame != -1) {
                    if (minigame == 2) {
                        Game.NetWorkController.Send('msg.C2GW_ReqGuessKingData', {});
                    } else {
                        this.openView(Game.Define.ACTIVEGAMEUINAME[minigame]);
                    }
                }
                this._randBrandInfo()
            }, this)
        ]))
    },
    onOpenGameSecond() {
        this.openView(Game.UIName.UI_MINIGAMESECOND);
    },
    onOpenKickAss() {
        this.openView(Game.UIName.UI_MINIGAMEKICKASS);
    }
});
