const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.tableView },
        label_chapter: { default: null, type: cc.Label },
        image_lastBtn: { default: null, type: cc.Sprite },
        image_nextBtn: { default: null, type: cc.Sprite },
    },

    onLoad() {
        this.initNotification();
        this.initData();
    },

    start() {
        this.updateView();
    },

    update(dt) {
    },

    onDestroy() {
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateView);
    },

    initData() {
        this.passList = [];
        this.passBase = Game.ConfigController.GetConfig("PassLevels");

        let _dialoguePass = JSON.parse(cc.sys.localStorage.getItem('dialoguePass'));     //本地判断剧情和关卡初始化
        if (_dialoguePass == null || _dialoguePass.userid != Game.UserModel.GetUserId()) {
            Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, 1);

            let passData = {
                userid: Game.UserModel.GetUserId(),
                lookPass: 1,
                pass: 1,
            };
            cc.sys.localStorage.setItem('dialoguePass', JSON.stringify(passData));

            Game.MaidModel.SetCurPass(1);
            Game.MaidModel.SetCurChapter(1);
        } else {
            Game.MaidModel.SetCurPass(_dialoguePass.pass);
            Game.MaidModel.SetCurChapter(Game.ConfigController.GetConfigById("PassLevels", _dialoguePass.pass).ChapterID);
        }
    },

    updateView() {
        this.updateTableView();
        this.updateChapter();
    },

    updateChapter() {
        this.label_chapter.string = `第${Game.MaidModel.GetCurChapter()}章`;
        this.image_lastBtn.node.active = Game.MaidModel.GetCurChapter() > 1;

        let passBase = Game.ConfigController.GetConfigById("PassLevels", Game.MaidModel.GetTopPass());
        if (passBase) {
            if (Game.MaidModel.GetCurChapter() < Game.MaidModel.GetTopChapter()) {
                Game.ResController.SetSprite(this.image_nextBtn, "Image/GameScene/Common/button_next");
            } else {
                Game.ResController.SetSprite(this.image_nextBtn, "Image/GameScene/Common/button_nextgray");
            }
            this.image_nextBtn.node.active = Game.MaidModel.GetCurChapter() < Game.MaidModel.GetTopChapter() || passBase.Index == 4;
        }
    },

    updateTableView() {
        if (this.passBase) {
            this.passList = [];
            for (let i = 0; i < this.passBase.length; i ++) {
                let info = this.passBase[i];
                let visibleId = Game.MaidModel.GetTopPass() + 1;    //策划需求要显示下一个未解锁的关卡
                if (info.ChapterID == Game.MaidModel.GetCurChapter() && info.Id <= visibleId) {
                    this.passList.push(info);
                }
            }
            this.tableView.initTableView(this.passList.length, { array: this.passList, target: this });
        }
    },

    updateCurPass(isNext) {
        let passId = 1;
        for (let i = 0; i < this.passBase.length; i ++) {
            let info = this.passBase[i];
            if (info.ChapterID == Game.MaidModel.GetCurChapter()) {
                this.passList.push(info);
                passId = info.Id;
                if (isNext) {break;}
            }
        }
        
        Game.MaidModel.SetCurPass(passId);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW);

        if (isNext) {   //切换新章节弹对话
            let _dialoguePass = JSON.parse(cc.sys.localStorage.getItem('dialoguePass'));
            let passBase = Game.ConfigController.GetConfigById("PassLevels", passId);
            
            if (_dialoguePass && passBase) {
                if (passId == Game.MaidModel.GetTopPass() && _dialoguePass.pass < passId) {
                    if (passBase.DialogueID != 0) {
                        Game.NotificationController.Emit(Game.Define.EVENT_KEY.SHOWDIALOGUE_PLAYER, passBase.DialogueID);
        
                        let passData = {
                            userid: Game.UserModel.GetUserId(),
                            pass: passId,
                        };
                        cc.sys.localStorage.setItem('dialoguePass', JSON.stringify(passData));
                    }
                }
            }
        }
    },

    OnClickLastChapter() {
        if (Game.MaidModel.GetCurChapter() <= 1) {
            return;
        }
        Game.MaidModel.SetCurChapter(Game.MaidModel.GetCurChapter() - 1);

        this.updateCurPass(false);
        this.updateTableView();
        this.updateChapter();
    },

    OnClickNextChapter() {
        if (Game.MaidModel.GetCurChapter() < Game.MaidModel.GetTopChapter()) {      //策划需求如当前关卡是该章节最高关卡则显示灰色下一章节的按钮
            Game.MaidModel.SetCurChapter(Game.MaidModel.GetCurChapter() + 1);

            this.updateCurPass(true);
            this.updateTableView();
            this.updateChapter();
        } else {
            this.openView(Game.UIName.UI_PASSDETAILVIEW);
        }
    },
});
