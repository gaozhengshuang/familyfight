let Game = require('../../Game');
let LinkItemNode = require('../Node/LinkItemNode');

const LinkStatus = {
    Status_Idle: 1,
    Status_Wait: 2,
    Status_Judge: 3,
    Status_End: 4,
}
const GameTime = 60;
cc.Class({
    extends: cc.Component,

    properties: {
        linkItemNodes: { default: [], type: [LinkItemNode] },
        maskNode: { default: null, type: cc.Node },
        countDownLabel: { default: null, type: cc.Label },

        linkInfos: { default: [] },
        status: { default: 0 },
        startTime: { default: 0 },
        firstItem: { default: null },
        secondItem: { default: null },
        matchInfos: { default: [] }
    },
    onLoad() {
        this._changeStatus(LinkStatus.Status_Idle);
    },
    start() {
    },
    update(dt) {
        if (this.status != LinkStatus.Status_Idle && this.status != LinkStatus.Status_End) {
            //倒计时
            let lastTime = GameTime - (Game.TimeController.GetCurTime() - this.startTime);
            this.countDownLabel.string = Game.moment.unix(lastTime).format('mm:ss');
            if (lastTime <= 0) {
                this._changeStatus(LinkStatus.Status_End);
            }
        }
    },
    onStartClick: function () {
        if (this.status == LinkStatus.Status_Idle) {
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
                this.firstItem.TurnFrontWithAnima(0.6);
            } else if (this.secondItem == null) {
                //第二个翻过来的
                this.secondItem = linkItem;
                this._changeStatus(LinkStatus.Status_Judge);
                this.secondItem.TurnFrontWithAnima(0.6, function () {
                    //都反过来了
                    if (this.firstItem.value == this.secondItem.value) {
                        //选对咯
                        this.firstItem.SetOpacity(100);
                        this.secondItem.SetOpacity(100);
                        this.matchInfos.push([this.firstItem.index, this.secondItem.index]);
                        this.firstItem = null;
                        this.secondItem = null;
                        this._changeStatus(LinkStatus.Status_Wait);
                    } else {
                        //选错了 翻回去
                        this.firstItem.TurnBackWithAnima(0.6);
                        this.secondItem.TurnBackWithAnima(0.6, function () {
                            this._changeStatus(LinkStatus.Status_Wait);
                            this.firstItem = null;
                            this.secondItem = null;
                        }.bind(this));
                    }
                }.bind(this));
            }
        }
    },
    _changeStatus: function (status) {
        if (this.status != status) {
            this.status = status;
            switch (status) {
                case LinkStatus.Status_Idle:
                    this._randomItem();
                    this.countDownLabel.string = '';
                    break;
                case LinkStatus.Status_Wait:
                    break;
                case LinkStatus.Status_Judge:
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
            item.TurnBackWithAnima(0.0);
            item.Init(i, this.linkInfos[i], this.onLinkItemClick.bind(this));
        }
    }
});
