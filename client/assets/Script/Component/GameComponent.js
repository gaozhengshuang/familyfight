const Game = require('../Game');

var GameComponent = cc.Class({
    extends: cc.Component,

    properties: {
        _url: { default: '' }
    },

    /**
     * 生命周期 begin
    */
    onLoad() {      //脚本初始化阶段。执行一次。
    },

    start() {       //在组件激活前，执行一次，在update执行之前 
    },

    update(dt) {    //组件进行更新时执行,帧计时器会一直执行函数中的操作
    },

    lateUpdate(dt) {    //所有组件的 update 都执行完之后调用
    },

    onDestroy() {        //当组件调用了 destroy()，会在该帧结束被统一回收，此时会调用 onDestroy 回调。
    },

    onEnable() {         //当组件的 enabled 属性从 false 变为 true 时，会激活 onEnable 回调。倘若节点第一次被 创建且 enabled 为 true，则会在onLoad 之后，start 之前被调用。
    },

    onDisable() {        //当组件的 enabled 属性从 true 变为 false 时，会激活 onDisable 回调。
    },
    /**
     * 生命周期 end
    */

    initUrl(url) {
        this._url = url;
    },

    openView(ui) {
        Game.ViewController.openView(ui);
    },

    closeView(ui, removeView = false) {
        Game.ViewController.closeView(ui, removeView);
    },

    gotoSceneView() {
        Game.ViewController.closeAllView();
    },

    onClose() {
        this.closeView(this._url);
    }
});

cc.GameComponent = module.export = GameComponent;