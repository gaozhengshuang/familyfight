const Game = require('../../Game');

const GameSecondStatus = {
    Status_Start: 1,                 //开始
    Status_Stop: 2,                 //暂停
    Status_Reset: 3,                 //再来一次
}

cc.Class({
    extends: cc.GameComponent,

    properties: {
        label_second: { default: null, type: cc.Label },
        label_btnStart: { default: null, type: cc.Label },
        button_back: { default: null, type: cc.Button },
    },

    update(dt) {
        if (this._gameType == GameSecondStatus.Status_Stop) {
            this._gameTime += dt;

            if (this._gameTime > 20) {      //超过20秒自动停止
                this._gameType = GameSecondStatus.Status_Reset;
                this._gameTime = 20;
                this.sendGameData();
            }
            this.refreshTime();
        }
    },

    onEnable() {
        this.initNotification();
        this.resetGame();
    },

    onDisable() {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckTenSecond', this, this.onGW2C_AckTenSecond);
    },

    initData() {
        this._gameTime = 0;
        this._gameType = GameSecondStatus.Status_Start;
    },

    initNotification() {
        Game.NetWorkController.AddListener('msg.GW2C_AckTenSecond', this, this.onGW2C_AckTenSecond);
    },

    resetGame() {
        this.initData();
        this.refreshStatus();
        this.refreshTime();
    },

    refreshStatus() {
        switch(this._gameType) {
            case GameSecondStatus.Status_Start:
                this.label_btnStart.string = "开始";
                break;
            case GameSecondStatus.Status_Stop:
                this.label_btnStart.string = "停";
                break;
            case GameSecondStatus.Status_Reset:
                this.label_btnStart.string = "再来一次";
                break;
        }
        this.button_back.node.active = this._gameType != GameSecondStatus.Status_Stop;
    },

    refreshTime() {
        let millscond = this._gameTime.toFixed(2);
        millscond = millscond.toString().split('.')[1];
        this.label_second.string = Game.moment.unix(this._gameTime).format('ss') + ':' + millscond;
    },

    onGW2C_AckTenSecond(msgid, data) {
        if (data.result == 0) {
            let _rewardType = 0;
            if (data.gold != null) {
                _rewardType = Game.TurnGameDefine.REWARD_TYPE.TYPE_GOLD;
            } else if (data.items != null) {
                _rewardType = Game.TurnGameDefine.REWARD_TYPE.TYPE_ITEM;
            }

            switch (_rewardType) {
                case Game.TurnGameDefine.REWARD_TYPE.TYPE_GOLD:
                    //金币
                    let value = data.gold;
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                        info: '<color=#ed5b5b>获得金币+' + Game.Tools.UnitConvert(value) + '</c></c>',
                        alive: 0.5,
                        delay: 1
                    });
                    Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_PLAYGOLDFLY);
                    Game.CurrencyModel.AddGold(value);
                    break;
                case Game.TurnGameDefine.REWARD_TYPE.TYPE_ITEM:
                    //物品
                    let itemConfig = Game.ItemModel.GetItemConfig(data.items[0].itemid);
                    if (itemConfig) {
                        Game.NotificationController.Emit(Game.Define.EVENT_KEY.TIP_REWARD, {
                            info: '<color=#ed5b5b>获得' + itemConfig.Name + '+' + data.items[0].num + '</c></c>',
                            alive: 0.5,
                            delay: 1
                        });
                    }
                    break;
            }
        }
    },

    onClickStartOrStop() {
        if (Game.CurrencyModel.GetPower() < 1) {
            this.showTips("体力不足");
            return;
        }

        switch(this._gameType) {
            case GameSecondStatus.Status_Start:
                this._gameType = GameSecondStatus.Status_Stop;
                break;
            case GameSecondStatus.Status_Stop:
                this._gameType = GameSecondStatus.Status_Reset;
                this.sendGameData();
                break;
            case GameSecondStatus.Status_Reset:
                this._gameType = GameSecondStatus.Status_Start;
                this.resetGame();
                break;
        }

        this.refreshStatus();
    },

    sendGameData() {
        if (this._gameTime > 10) {
            if (this._gameTime - 10 < 0.03) {
                this._gameTime = 10;
                this.refreshTime();
            }
        } else {
            if (10 - this._gameTime < 0.03) {
                this._gameTime = 10;
                this.refreshTime();
            }
        }

        Game.NetWorkController.Send('msg.C2GW_ReqTenSecond', {
            hit: this._gameTime == 10,
        });
    }
});
