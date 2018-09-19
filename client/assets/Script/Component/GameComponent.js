import Game from '../../Game';

var GameComponent = cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    openView(ui) {
        Game.ViewController.openView(ui);
    },

    closeView(ui, removeView = false) {
        Game.ViewController.closeView(ui, removeView);
    },
});

cc.GameComponent = module.export = GameComponent;