let Game = require('../../Game');

cc.Class({
    extends: cc.Component,

    properties: {
        countLabel: { default: null, type: cc.Label },
        countDownLabel: { default: null, type: cc.Label },
        stateLabel: { default: null, type: cc.Label },
        progressBar: { default: null, type: cc.ProgressBar },
    },
    onLoad() {
    },
    start() {
        this.UpdatePowerInfo();
    },
    update(dt) {
        this.UpdatePowerInfo();
    },
    UpdatePowerInfo: function () {
        let curPower = Game.CurrencyModel.GetPower();
        let maxPower = Game.CurrencyModel.GetMaxPower();
        this.countLabel.string = curPower + '/' + maxPower;
        if (curPower > maxPower) {
            this.stateLabel.string = '+' + (maxPower - curPower);
            this.countDownLabel.string = '';
            this.progressBar.progress = 1;
        } else if (curPower == maxPower) {
            this.stateLabel.string = '满';
            this.countDownLabel.string = '';
            this.progressBar.progress = 1;
        } else {
            let lasttime = Game.CurrencyModel.GetNextPowerTime() - Game.TimeController.GetCurTime()
            this.stateLabel.string = '+' + Game.ConfigController.GetConfig('PowerAddition');
            if (lasttime > 0) {
                this.countDownLabel.string = Game.moment.unix(lasttime).format('mm:ss');
                this.progressBar.progress = 1 - (lasttime / Game.ConfigController.GetConfig('PowerAddInterval'));
            } else {
                this.countDownLabel.string = '';
                this.progressBar.progress = 1;
            }
        }
    },
});
