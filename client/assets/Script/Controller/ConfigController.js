const Tools = require('../Util/Tools');
const _ = require('lodash');

let ConfigController = function () {
    this._configs = {};
};
/**
 * 
 * @param {Function} cb 
 */
ConfigController.prototype.Init = function (cb) {
    cc.loader.loadResDir('Json/', function (err, datas) {
        if (err) {
            Tools.InvokeCallback(cb, err);
            return;
        }
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];
            delete data.json.Tool;
            delete data.json.Version;
            for (let j in data.json) {
                this._configs[j] = data.json[j];
            }
        }
        Tools.InvokeCallback(cb, null);
    }.bind(this));
};

ConfigController.prototype.GetConfig = function (key) {
    return this._configs[key];
}

ConfigController.prototype.GetConfigByIndex = function (key, index) {
    if (this._configs[key] == null) {
        return null;
    }
    return this._configs[key][index];
}

ConfigController.prototype.GetConfigById = function (key, id) {
    if (this._configs[key] == null) {
        return null;
    }
    return _.find(this._configs[key], { Id: id });
}

module.exports = new ConfigController();