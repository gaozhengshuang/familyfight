import Tools from '../util/Tools';
import _ from 'lodash';

var ViewController = function () {
    this._viewList = [];
}

ViewController.prototype.Init = function (cb) {
    Tools.InvokeCallback(cb);
}

/**
 * 打开界面
 */
ViewController.prototype.openView = function (ui) {
    if (ui != null) {
        let _view = _.find(this._viewList, function(v) {
            return v.uiname == ui;
        });
    
        if (_view) {
            _.forEach(this._viewList, function(v) {
                if (_view.active) {
                    v.active = _view.uiname == v.uiname;
                }
                v.setLocalZOrder(_view.uiname == v.uiname ? 2 : 1);
            });
            
            let _gameComponet = _view.getComponent('GameComponent');
            if (_gameComponet) {
                _gameComponet.onReset();
            }

            _view.active = true;
        } else {
            cc.loader.loadRes(ui, function (err, prefab) {
                if (err) {
                    console.log('[严重错误] 奖励资源加载错误 ' + err);
                } else {
                    let _view = cc.instantiate(prefab);
                    _view.uiname = ui;
                    let canvas = cc.director.getScene().getChildByName('Canvas');
                    canvas.getChildByName("ViewLayer").addChild(_view);
                    this._viewList.push(_view);
                }
            }.bind(this));
        }
    }  
}

/**
 * 关闭界面,参数true彻底删除界面,false隐藏界面(默认false)
 */
ViewController.prototype.closeView = function (ui, clear = false) {
    if (ui != null) {
        let _view = _.find(this._viewList, function(v) {
            return v.uiname == ui;
        });
        
        if (_view) {
            if (clear) {
                _view.destroy();

                _.remove(this._viewList, function (v) {
                    return v.uiname == ui;
                });
            } else {
                _view.active = false;
            }
        }
    }
}

/**
 * 关闭所有界面,参数true彻底删除界面,false隐藏界面(默认false)
 */
ViewController.prototype.closeAllView = function (clear = false) {
    if (clear) {
        let canvas = cc.director.getScene().getChildByName('Canvas');
        canvas.getChildByName("ViewLayer").destroyAllChildren();
        this._viewList = [];
    } else {
        _.forEach(this._viewList, function(v) {
            v.active = false;
        })
    }
}

module.exports = new ViewController();