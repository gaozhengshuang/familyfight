let Tools = require('../Util/Tools');
let Define = require('../Util/Define');
let NotificationController = require('../Controller/NotificationController');
let CommonPlatform = {
    CopyToClipboard: function (obj) {
        console.log('CopyToClipboard');
    },
    InitPlatform: function () {
        console.log('InitPlatform');
    },
    AutoLogin: function () {
        console.log('AutoLogin');
        cc.director.loadScene("LoginScene");
    },
    SendUserInfo: function (cb) {
        Tools.InvokeCallback(cb, '', '');
    },
    ShareMessage: function () {
        console.log('ShareMessage');
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, { text: '<color=#ffffff>微信版本才支持分享功能哟</color>' });
    },
    RequestPay: function (payment) {
        console.log('RequestPay ' + payment);
    }
}

module.exports = CommonPlatform;