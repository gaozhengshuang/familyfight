const _ = require('lodash');
const Define = require('../Util/Define');
const Tools = require('../Util/Tools');
const NotificationController = require('./NotificationController');

let AudioController = function () {
    this.audioClips = {};
    this.audio = null;
    this.effectIds = [];
    this.effectCallbacks = {}
    this.disableMusic = cc.sys.localStorage.getItem(Define.DATA_KEY.DISABLE_MUSIC) == 'true';
    this.disableEffect = cc.sys.localStorage.getItem(Define.DATA_KEY.DISABLE_EFFECT) == 'true';
    this.audioName = '';

    this.bgMusics = [];
};

AudioController.prototype.Init = function (cb) {
    NotificationController.On(Define.EVENT_KEY.MUSIC_CHANGE, this, this.onChangeMusic);
    NotificationController.On(Define.EVENT_KEY.EFFECT_CHANGE, this, this.onChangeEffect.bind(this));
    cc.loader.loadResDir('Audio/', cc.AudioClip, function (err, ress, urls) {
        if (err) {
            console.log('[严重错误] 奖励资源加载错误 ' + err);
        } else {
            for (let i = 0; i < ress.length; i++) {
                this.audioClips[urls[i]] = ress[i];
            }
        }
        Tools.InvokeCallback(cb, err);
    }.bind(this));
}

AudioController.prototype.PlayMusic = function (name, loop = true) {
    this.audioName = name;
    this.bgMusics.push(name);
    if (this.disableMusic) {
        return;
    }
    let musiclen = this.bgMusics.length
    if (musiclen >= 2 && this.bgMusics[musiclen - 2] == this.bgMusics[musiclen - 1]) {
        return;
    }
    this.PlayAudio(name, loop);
}

AudioController.prototype.StopMusic = function () {
    if (this.bgMusics.length <= 0) {
        return;
    }
    let oldName = this.bgMusics[this.bgMusics.length - 1];
    this.bgMusics = _.take(this.bgMusics, this.bgMusics.length - 1);
    let newName = this.bgMusics[this.bgMusics.length - 1];
    this.audioName = newName;
    if (newName != null && newName != oldName && !this.disableMusic) {
        this.PlayAudio(newName, true);
    }
};
AudioController.prototype.PlayEffect = function (name, cb) {
    if (this.disableEffect) {
        return;
    }
    let id = cc.audioEngine.play(this.audioClips[name], false, 1);
    this.effectIds.push(id);
    this.effectCallbacks[id] = cb;
    cc.audioEngine.setFinishCallback(id, this._onEffectFinish.bind(this, id));
};

AudioController.prototype.PlayAudio = function (name, loop) {
    if (this.audio != null) {
        cc.audioEngine.stop(this.audio);
        this.audio = null;
    }
    this.audio = cc.audioEngine.play(this.audioClips[name], loop, 1);
    cc.audioEngine.setFinishCallback(this.audio, this._onMusicFinish.bind(this));
}

AudioController.prototype.StopAllEffect = function () {
    for (let i = 0; i < this.effectIds.length; i++) {
        cc.audioEngine.stop(this.effectIds[i]);
    }
    this.effectIds = [];
    for (let key in this.effectCallbacks) {
        let cb = this.effectCallbacks[key];
        Tools.InvokeCallback(cb);
    }
    this.effectCallbacks = {};
}

AudioController.prototype.SetMusicVolume = function (val) {
    if (this.audio != null) {
        cc.audioEngine.setVolume(this.audio, val);
    }
}

AudioController.prototype.onChangeMusic = function (disable) {
    this.disableMusic = disable;
    if (disable) {
        if (this.audio != null) {
            cc.audioEngine.stop(this.audio);
            this.audio = null;
        }
    } else {
        if (this.audioName != null && this.audioName != '') {
            this.PlayAudio(this.audioName, true);
        }
    }
}
AudioController.prototype.onChangeEffect = function (disable) {
    this.disableEffect = disable;
    if (disable) {
        for (let i = 0; i < this.effectIds.length; i++) {
            cc.audioEngine.stop(this.effectIds[i]);
        }
        this.effectIds = [];
        for (let key in this.effectCallbacks) {
            let cb = this.effectCallbacks[key];
            Tools.InvokeCallback(cb);
        }
        this.effectCallbacks = {};
    }
}

AudioController.prototype._onMusicFinish = function () {
    this.audio = null;
    this.audioName = '';
}

AudioController.prototype._onEffectFinish = function (id) {
    _.remove(this.effectIds, function (n) {
        return n == id;
    });
    let cb = this.effectCallbacks[id];
    Tools.InvokeCallback(cb);
    delete this.effectCallbacks[id];
}

module.exports = new AudioController();