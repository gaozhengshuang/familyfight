//通用按钮点击声音
const AudioController = require('../../Controller/AudioController');
cc.Button.prototype.defaultEffect = 'Audio/click';
cc.Button.prototype.setEffectName = function (name) {
    this.defaultEffect = name || '';
}
cc.Button.prototype.oldTouchEnd = cc.Button.prototype._onTouchEnded;
cc.Button.prototype._soundOn = true;
cc.Button.prototype.setSoundEffect = function (on) {
    this._soundOn = on;
}
cc.Button.prototype._onTouchEnded = function (event) {
    if (this.interactable && this.enabledInHierarchy && this._pressed && this._soundOn && this.defaultEffect != '') {
        AudioController.PlayEffect(this.defaultEffect);
    }
    this.oldTouchEnd(event);
}