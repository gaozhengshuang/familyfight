let Game = require('../../Game');

const DialogueStatus = {
    Status_Idle: 1,
    Status_Dialogue: 2,
    Status_Wait: 3,
    Status_End: 4
}

const LocationType = {
    Type_Left: 1,
    Type_Right: 2,
}

const MoveupSpeed = 720;
const TintDelay = 0.5;
const GrayColor = 100;

const LeftPosX = -220;
const RightPosX = 220;

const DialogueInterval = 0.05;

const ContinueInterval = 0.5;
const ContinueMax = 3;
const ContinueContent = '点击继续';
const ContinueSuffix = '>';

cc.Class({
    extends: cc.Component,

    properties: {
        parentNode: { default: null, type: cc.Node },
        leftHeadSprite: { default: null, type: cc.Sprite },
        rightHeadSprite: { default: null, type: cc.Sprite },
        dialogueContentNode: { default: null, type: cc.Node },
        nameNode: { default: null, type: cc.Node },
        nameLabel: { default: null, type: cc.Label },
        contentLabel: { default: null, type: cc.Label },
        continueLabel: { default: null, type: cc.Label },

        dialogues: { default: [] },
        dialogue: { default: null },
        status: { default: 0 },
        passedTime: { default: 0.0 },
        continueIndex: { default: 0 },
    },
    onLoad: function () {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    },
    update: function (dt) {
        switch (this.status) {
            case DialogueStatus.Status_Idle:
                //在向上飘
                let addition = MoveupSpeed * dt;
                this.parentNode.y = Math.min(this.parentNode.y + addition, -640);
                if (this.parentNode.y >= -640) {
                    this._changeDialogueStatus(DialogueStatus.Status_Dialogue);
                }
                break;
            case DialogueStatus.Status_Dialogue:
                this.passedTime += dt;
                if (this.passedTime >= DialogueInterval) {
                    this.passedTime = 0.0;
                    //要多一个字
                    let len = this.contentLabel.string.length;
                    if (len >= this.dialogue.Content.length) {
                        this._changeDialogueStatus(DialogueStatus.Status_Wait);
                        return;
                    }
                    let info = this.dialogue.Content.substr(0, len + 1);
                    this.contentLabel.string = info;
                }
                break;
            case DialogueStatus.Status_Wait:
                this.passedTime += dt;
                if (this.passedTime >= ContinueInterval) {
                    this.passedTime = 0.0;
                    this.continueIndex++;
                    if (this.continueIndex > ContinueMax) {
                        this.continueIndex = 0;
                    }
                    this.continueLabel.string = ContinueContent + Game._.repeat(ContinueSuffix, this.continueIndex);
                }
                break;
            case DialogueStatus.Status_End:
                //在向下飘
                let reduce = MoveupSpeed * dt;
                this.parentNode.y = Math.max(this.parentNode.y - reduce, -1000);
                if (this.parentNode.y <= -1000) {
                    this.node.destroy();
                }
                break;
        }
    },
    onDestroy: function () {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    },
    onTouchStart: function (event) {
        if (this.status == DialogueStatus.Status_Wait) {
            //这里才能跳转下一条哦
            let box = this.dialogueContentNode.getBoundingBoxToWorld();
            if (box.contains(event.getLocation())) {
                this._changeDialogueStatus(DialogueStatus.Status_Dialogue);
            }
        }
    },
    //根据id 构建对话的列表
    Init: function (id) {
        let dialogues = Game.ConfigController.GetConfig('TDialogue');
        this.dialogues = [];
        for (let i = 0; i < dialogues.length; i++) {
            if (dialogues[i].Index == id) {
                this.dialogues.push(Game._.cloneDeep(dialogues[i]));
            }
        }
        if (this.dialogues.length == 0) {
            this.node.destroy();
        }
        this._changeDialogueStatus(DialogueStatus.Status_Idle);
    },
    //更改对话的状态
    _changeDialogueStatus: function (status) {
        this.status = status;
        switch (status) {
            case DialogueStatus.Status_Idle:
                break;
            case DialogueStatus.Status_Dialogue:
                console.log(this.parentWidget);
                let oldDialogue = this.dialogue;
                this.dialogue = this._getNextDialogue();
                if (this.dialogue == null) {
                    //对话结束
                    this._changeDialogueStatus(DialogueStatus.Status_End);
                    return;
                }
                //处理头像
                this.leftHeadSprite.node.stopAllActions();
                this.rightHeadSprite.node.stopAllActions();
                let curHeads = this._getHeadByDialogue(this.dialogue);
                let oldHeads = this._getHeadByDialogue(oldDialogue);
                let curLocation = this.dialogue.NameLocation;
                //看左边头像
                this._handleHead(this.leftHeadSprite, curHeads.leftHead, oldHeads.leftHead, curLocation == LocationType.Type_Left ? 255 : GrayColor);
                //处理右边的头像
                this._handleHead(this.rightHeadSprite, curHeads.rightHead, oldHeads.rightHead, curLocation == LocationType.Type_Right ? 255 : GrayColor);

                //处理名字框
                this.nameNode.active = true;
                switch (curLocation) {
                    case LocationType.Type_Left:
                        this.nameNode.x = LeftPosX;
                        break;
                    case LocationType.Type_Right:
                        this.nameNode.x = RightPosX;
                        break;
                }
                this.nameLabel.string = this.dialogue.Name;
                //处理对话框
                this.contentLabel.string = '';
                //处理点击继续框
                this.continueLabel.string = '';
                this.passedTime = 0.0;
                break;
            case DialogueStatus.Status_Wait:
                this.continueIndex = 0;
                this.passedTime = 0.0;
                this.continueLabel.string = ContinueContent;
                break;
            case DialogueStatus.Status_End:
                break;
        }
    },
    //获取下一段对话
    _getNextDialogue: function () {
        if (this.dialogue == null) {
            return this.dialogues[0];
        }
        let index = Game._.findIndex(this.dialogues, { Id: this.dialogue.Id });
        return this.dialogues[index + 1];
    },
    _getHeadByDialogue: function (dialogue) {
        let leftHead = '';
        let rightHead = '';
        if (dialogue == null) {
            return {
                leftHead,
                rightHead
            }
        }
        for (let i = 0; i < dialogue.HeadSprite.length && i < 2; i++) {
            let head = dialogue.HeadSprite[i];
            let local = dialogue.HeadLocation[i];
            if (local == LocationType.Type_Left) {
                leftHead = head;
            } else if (local == LocationType.Type_Right) {
                rightHead = head;
            }
        }
        return {
            leftHead,
            rightHead
        }
    },
    _handleHead: function (headSprite, curHead, oldHead, color) {
        if (curHead == '') {
            //没有左边头像
            headSprite.node.active = false;
        } else {
            headSprite.node.active = true;
            if (curHead != oldHead) {
                //不一样 直接切换
                Game.ResController.GetSpriteFrameByName(curHead, function (err, spriteframe) {
                    headSprite.spriteFrame = spriteframe;
                    headSprite.node.color = cc.color(color, color, color);
                }.bind(this));
            } else {
                //和原来一样 播动画吧
                headSprite.node.runAction(cc.tintTo(TintDelay, color, color, color));
            }
        }
    }
});
