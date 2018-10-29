let Tools = require('../Util/Tools');
let Define = require('../Util/Define');
let NotificationController = require('../Controller/NotificationController');

let CommonPlatform = {
    PLATFORM : 'Normal',    //'Normal',//'Wechat',//'QQPlay'
    WSPrefix : 'ws://',
    LoginHost : '192.168.30.206:7020',   //'210.73.214.72:7020' '192.168.30.206:7020'  LoginPort: 17002
    LoginSuffix : 'ws_handler',
    RegisteHost : 'http://192.168.30.206:18000/',     //'http://192.168.30.206:18000/'

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
        NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, "微信版本才支持分享功能哟");
    },
    RequestPay: function (payment) {
        console.log('RequestPay ' + payment);
    }
}

module.exports = CommonPlatform;