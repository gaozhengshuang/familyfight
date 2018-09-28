const Game = require('../../Game');

cc.Class({
    extends: cc.GameComponent,

    properties: {
        tableView: { default: null, type: cc.Node },
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
        Game.NotificationController.Off(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initNotification() {
        Game.NotificationController.On(Game.Define.EVENT_KEY.USERINFO_UPDATEPASS, this, this.updateTableView);
    },

    initData() {
        this.passList = [];
        this.passBase = Game.ConfigController.GetConfig("PassLevels");
    },

    updateView() {
        this.updateTableView();
        this.updateChapter();
    },

    updateChapter() {
        this.label_chapter.string = `第${Game.MaidModel.GetCurChapter()}章`;
        this.image_lastBtn.node.active = Game.MaidModel.GetCurChapter() > 1;
        this.image_nextBtn.node.active = Game.MaidModel.GetCurChapter() < Game.MaidModel.GetTopChapter();
    },

    updateTableView() {
        if (this.passBase) {
            this.passList = [];
            for (let i = 0; i < this.passBase.length; i ++) {
                let info = this.passBase[i];
                if (info.ChapterID == Game.MaidModel.GetCurChapter()) {
                    this.passList.push(info);
                }
            }
            this.tableView.getComponent(cc.tableView).initTableView(this.passList.length, { array: this.passList, target: this });
        }
    },

    updateCurPass(isNext) {
        let passIndex = 1;
        for (let i = 0; i < this.passBase.length; i ++) {
            let info = this.passBase[i];
            if (info.ChapterID == Game.MaidModel.GetCurChapter()) {
                this.passList.push(info);
                passIndex = info.Id;
                if (isNext) {break;}
            }
        }
        
        Game.MaidModel.SetCurPass(passIndex);
        Game.NotificationController.Emit(Game.Define.EVENT_KEY.UPDATE_GAMEVIEW);
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
        if (Game.MaidModel.GetCurChapter() >= Game.MaidModel.GetTopChapter()) {
            return;
        }
        Game.MaidModel.SetCurChapter(Game.MaidModel.GetCurChapter() + 1);

        this.updateCurPass(true);
        this.updateTableView();
        this.updateChapter();
    },
});
