const Game = require('../../Game');
cc.Class({
    extends: cc.GameComponent,

    properties: {
        normalTabButtons: { default: [], type: [cc.Button] },
        disableTabButtonNodes: { default: [], type: [cc.Node] },
        tabInfoNods: { default: [], type: [cc.Node] },
        signinButton: { default: null, type: cc.Button },
        signinIndexNodes: { default: [], type: [cc.Node] },
        dailypowerButton: { default: null, type: cc.Button },
        lastShareTimes: { default: null, type: cc.Label },
        shareButton: { default: null, type: cc.Button },

        index: { default: 0 },
        updateTime: { default: 0 },
        loading: { default: false }
    },

    onEnable: function () {
        Game.NetWorkController.AddListener('msg.GW2C_AckSignin', this, this.onAckSignin);
        Game.NetWorkController.AddListener('msg.GW2C_AckDailyPower', this, this.onAckDailyPower);
        Game.NetWorkController.AddListener('msg.GW2C_AckShareMessage', this, this._updateTab);
        this.index = Game._.get(this._data, 'tabindex', 0);
        this.updateTime = Game.TimeController.GetCurTime();
        this._updateTab();
    },
    onDisable: function () {
        Game.NetWorkController.RemoveListener('msg.GW2C_AckSignin', this, this.onAckSignin);
        Game.NetWorkController.RemoveListener('msg.GW2C_AckDailyPower', this, this.onAckDailyPower);
        Game.NetWorkController.RemoveListener('msg.GW2C_AckShareMessage', this, this._updateTab);
    },
    onTabClick: function (event, index) {
        this.index = Game._.parseInt(index);
        this._updateTab();
    },
    onSigninClick: function () {
        if (this.loading) {
            return;
        }
        this.loading = true;
        Game.NetWorkController.Send('msg.C2GW_ReqSignin', {});
    },
    onDailyPowerClick: function () {
        if (this.loading) {
            return;
        }
        this.loading = true;
        Game.NetWorkController.Send('msg.C2GW_ReqDailyPower', {});
    },
    onSharePowerClick: function () {
        Game.Platform.ShareMessage(Game.Define.SHARETYPE.ShareType_Power, 0, this.updateTime);
    },
    onAckSignin: function (msgid, data) {
        this.loading = false;
        if (data.result == 0) {
            Game.RewardController.PlayLastReward();
            this._updateTab();
        }
    },
    onAckDailyPower: function (msgid, data) {
        this.loading = false;
        if (data.result == 0) {
            Game.RewardController.PlayLastReward();
            this._updateTab();
        }
    },
    _updateTab: function () {
        for (let i = 0; i < this.normalTabButtons.length; i++) {
            this.normalTabButtons[i].interactable = (this.index != i);
        }
        for (let i = 0; i < this.disableTabButtonNodes.length; i++) {
            this.disableTabButtonNodes[i].active = (this.index == i);
        }
        for (let i = 0; i < this.tabInfoNods.length; i++) {
            this.tabInfoNods[i].active = (this.index == i);
        }
        switch (this.index) {
            case 0:
                //每日签到
                this.signinButton.interactable = Game.ActiveController.CanSignin();
                for (let i = 0; i < this.signinIndexNodes.length; i++) {
                    this.signinIndexNodes[i].active = (i < Game.ActiveController.GetSigninIndex());
                }
                break;
            case 1:
                //每日体力
                this.dailypowerButton.interactable = Game.ActiveController.CanDailyPower();
                break;
            case 2:
                //分享体力
                let lasttime = Game.ActiveController.GetLastShareRewardTimes(Game.Define.SHARETYPE.ShareType_Power, 0, this.updateTime);
                this.lastShareTimes.string = '剩余次数:' + lasttime;
                this.shareButton.interactable = (lasttime > 0);
                break;
            default:
                break;
        }
    }
});
