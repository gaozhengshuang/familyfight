import Game from '../../Game';

var GameComponent = cc.Class({
    extends: cc.Component,

    openView(ui) {
        switch (this.uiType) {
            case Game.Define.UI_KEY.LAYER:
                Game.ViewController.openView(ui);
                break;

            case Game.Define.UI_KEY.ALERT:
                Game.ViewController.openAlert(ui);
                break;
        }
    },

    closeView(ui, removeView = false) {
        switch (this.uiType) {
            case Game.Define.UI_KEY.LAYER:
                Game.ViewController.closeView(ui, removeView);
                break;

            case Game.Define.UI_KEY.ALERT:
                Game.ViewController.closeAlert(ui, removeView);
                break;
        }
    },
});

cc.GameComponent = module.export = GameComponent;