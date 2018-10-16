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

        status: { default: BrandStatus.Status_Idle },
        brandInfos: { default: [] },
        brandConfigs: { default: [] },
        shuffleTargetWorldPos: { default: cc.v2(0, 0) },
        showTargetWorldPos: { default: cc.v2(0, 0) },
        clickIndex: { default: 0 },
        rewardId: { default: 0 },
        rewardGold: { default: 0 }
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
    },
    onEnable: function () {
        for (let i = 0; i < this.brandViews.length; i++) {
            let view = this.brandViews[i];
            view.StopAllAction();
        }
        this.status = 0;
        this._randBrandInfo();
    },
    update: function (dt) {
    },
    onDestroy: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_RetTurnBrand', this, this.onRetTurnBrand);
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
            this.rewardGold = data.gold;
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
        // if (config.Dialogue != 0) {
        //     Game.GameController.ShowDialogue(this.dialogueNode, config.Dialogue)
        // }
        let node = null;
        let view = null;
        switch (config.Type) {
            case Game.TurnGameDefine.REWARD_TYPE.TYPE_GOLD:
                //金币
                let value = this.rewardGold;
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                    info: '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】获得<color=#ed5b5b>金币+' + Game.Tools.UnitConvert(value) + '</c></c>',
                    alive: 0.5,
                    delay: 1
                });
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_PLAYGOLDFLY);
                Game.CurrencyModel.AddGold(value);
                this.node.runAction(cc.sequence([
                    cc.delayTime(0.5),
                    cc.callFunc(function () {
                        this._hideBrands();
                    }, this),
                    cc.delayTime(1.2),
                    cc.callFunc(function () {
                        Game.GuideController.NextGuide();
                        this._randBrandInfo()
                    }, this)
                ]))
                break;
            case Game.TurnGameDefine.REWARD_TYPE.TYPE_POWER:
                //体力
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                    info: '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】获得<color=#ed5b5b>体力+' + config.Value + '</c></c>',
                    alive: 0.5,
                    delay: 1
                });
                Game.NetWorkController.Send('msg.C2GW_ReqPower');
                this.node.runAction(cc.sequence([
                    cc.delayTime(0.5),
                    cc.callFunc(function () {
                        this._hideBrands();
                    }, this),
                    cc.delayTime(1.2),
                    cc.callFunc(function () {
                        Game.GuideController.NextGuide();
                        this._randBrandInfo()
                    }, this)
                ]))
                break;
            case Game.TurnGameDefine.REWARD_TYPE.TYPE_MINIGAME:
                //小游戏
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                    info: '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】前去-<color=#ed5b5b>' + MiniGameName[config.RewardId] + '</c></c>',
                    alive: 0.5,
                    delay: 1
                });
                this.node.runAction(cc.sequence([
                    cc.delayTime(0.5),
                    cc.callFunc(function () {
                        this._hideBrands();
                    }, this),
                    cc.delayTime(1.2),
                    cc.callFunc(function () {
                        Game.GuideController.NextGuide();
                        this.openView(MiniGameId[config.RewardId]);
                        this._randBrandInfo()
                    }, this)
                ]))
                break;
            case Game.TurnGameDefine.REWARD_TYPE.TYPE_ITEM:
                //物品
                let itemConfig = Game.ItemModel.GetItemConfig(config.RewardId)
                Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                    info: '<color=#6d282d>抽到【<color=#ed5b5b>' + config.Name + '</c>】获得<color=#ed5b5b>' + itemConfig.Name + '+' + config.Value + '</c></c>',
                    alive: 0.5,
                    delay: 1
                });
                this.node.runAction(cc.sequence([
                    cc.delayTime(0.5),
                    cc.callFunc(function () {
                        this._hideBrands();
                    }, this),
                    cc.delayTime(1.2),
                    cc.callFunc(function () {
                        Game.GuideController.NextGuide();
                        this._randBrandInfo()
                    }, this)
                ]))
                break;
            default:
                break;
        }
    }
});
