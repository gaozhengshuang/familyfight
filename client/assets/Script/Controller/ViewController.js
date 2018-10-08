const _ = require('lodash');
const Tools = require('../Util/Tools');

var ViewController = function () {
    this._viewList = [];
    this._dialoguePrefab = null;
}

ViewController.prototype.Init = function (cb) {
    cc.loader.loadRes("Prefab/DialogueNode", function (err, prefab) {
        if (err) {
            Tools.InvokeCallback(cb, '[严重错误] 奖励资源加载错误 ' + err);
        } else {
            this._dialoguePrefab = prefab;
            Tools.InvokeCallback(cb, null);
        }
    }.bind(this));
}

/**
 * 打开界面
 */
ViewController.prototype.openView = function (ui, data = null) {
    if (ui != null) {
        let _view = null;
        let _gameComponet = null;

        _view = _.find(this._viewList, function (v) {
            return v.uiname == ui;
        });

        if (_view) {
            _gameComponet = _view.getComponent('GameComponent');
            if (_gameComponet) {
                if (data != null) {
                    _gameComponet.setData(data);        //设置界面数据
                }
            }

            _.forEach(this._viewList, function (v) {
                if (_view.active) {
                    v.active = _view.uiname == v.uiname;
                }
                v.setLocalZOrder(_view.uiname == v.uiname ? 2 : 1);     //重新打开界面设置显示层级
            });
            _view.active = true;
        } else {
            cc.loader.loadRes(ui, function (err, prefab) {
                if (err) {
                    console.log('[严重错误] 奖励资源加载错误 ' + err);
                } else {
                    _view = cc.instantiate(prefab);
                    _view.uiname = ui;

                    _gameComponet = _view.getComponent('GameComponent');
                    if (_gameComponet) {
                        _gameComponet.initUrl(ui);      //初始化界面的路径
                        if (data != null) {
                            _gameComponet.setData(data);        //设置界面数据
                        }
                    }

                    let canvas = cc.director.getScene().getChildByName('Canvas');   //设置界面显示位置
                    canvas.getChildByName("ViewLayer").addChild(_view);
                    this._viewList.push(_view);

                    _view.setLocalZOrder(2);
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
        let _view = _.find(this._viewList, function (v) {
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
        _.forEach(this._viewList, function (v) {
            v.active = false;
        })
    }
}

/**
 * 获得View目标
 */
ViewController.prototype.getViewByName = function (ui) {
    let _view = null;
    if (ui != null) {
        _view = _.find(this._viewList, function (v) {
            return v.uiname == ui;
        });
    }
    return _view;
}

/**
 * 传入ui路径跟name获得node
 */
ViewController.prototype.seekChildByName = function (ui, name) {
    //遍历方法
    let _find = function (node, name) {
        if (node.name == name) {
            return node;
        }
    
        for (let i = 0; i < node.children.length; i ++) {
            let res = _find(node.children[i], name);
            if (res != null) {
                return res;
            }
        }
    
        return null;
    }

    let _child = null;
    let _view = this.getViewByName(ui);
    if (_view) {
        _child = _find(_view, name);
    }
    return _child;
}

/**
 * 打开对话界面
 */
ViewController.prototype.showDialogue = function (parent, id) {
    let node = cc.instantiate(this._dialoguePrefab);
    let dialogView = node.getComponent('DialogView');
    parent.addChild(node);
    dialogView.Init(id);
}

module.exports = new ViewController();