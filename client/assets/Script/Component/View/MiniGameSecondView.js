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
            this._millisecond += dt;
            if (this._millisecond > 1) {
                this._millisecond = 0;
            } 

            if (this._gameTime > 20) {      //超过20秒自动停止
                this._gameType = GameSecondStatus.Status_Reset;
                this._gameTime = 20;
                this._millisecond = 0;
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
        this._millisecond = 0;
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
        let millscond = Math.floor(this._millisecond * 100);
        if (millscond == 0) {
            millscond = '00';
        } else if (millscond < 10) {
            millscond = '0' + millscond;
        }
        this.label_second.string = Game.moment.unix(this._gameTime).format('ss') + ':' + millscond;
    },

    onGW2C_AckTenSecond(msgid, data) {
        if (data.result == 0) {

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
        Game.NetWorkController.Send('msg.C2GW_ReqTenSecond', {
            hit: this._gameTime == 10,
        });
    }
});
