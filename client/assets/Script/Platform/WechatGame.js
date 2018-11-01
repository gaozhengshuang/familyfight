let _ = require('lodash')
let async = require('async');

let CommonPlatform = require('./CommonGame')
let Define = require('../Util/Define');
let Platform = require('../Platform/CommonGame');

let UserModel = require('../Model/User');
let LoginController = require('../Controller/LoginController');
let NetWorkController = require('../Controller/NetWorkController');
let NotificationController = require('../Controller/NotificationController');
let ActiveController = require('../Controller/ActiveController');
let WechatPlatform = _.merge(_.cloneDeep(CommonPlatform), {
    CopyToClipboard: function (obj) {
        wx.setClipboardData(obj)
    },
    InitPlatform: function () {
        // wx.showShareMenu();
        wx.onShow(function (res) {
            console.log(res);
            NotificationController.Emit(Define.EVENT_KEY.ON_SHOWGAME, res);
        });
        // wx.onShareAppMessage(function (res) {
        //     console.log(res);
        //     NotificationController.Emit(Define.EVENT_KEY.ON_SHARE);
        //     return {
        //         //TODO 
        //         title: '炮炮大作战答题',
        //         imageUrl: 'https://dati-cdn.giantfun.cn/sharebg.png',
        //     }
        // })
    },
    AutoLogin: function () {
        async.waterfall([
            function (anext) {
                wx.login({
                    success: function (res) {
                        anext(null, res)
                    },
                    fail: function () {
                        anext('wx.login 失败')
                    }
                })
            },
            function (res, anext) {
                console.log("code:", res.code)
                wx.request({
                    url: Platform.RegisteHost,
                    data: {
                        gmcmd: 'wx_login',
                        tempauthcode: res.code
                    },
                    header: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    success: function (res) {
                        console.log("wx_login: ", res.data);
                        if (res.data.status == 0) {
                            anext(null, res.data.msg);
                        } else {
                            anext(res.data.msg);
                        }
                    },
                    fail: function (err) {
                        anext('请求wx_login失败');
                    }
                })
            },
            function (openid, anext) {
                let loginInfo = {
                    openid: openid,
                    nickname: '',
                    face: '',
                    invitationcode: ''
                }
                UserModel.loginInfo = loginInfo;
                LoginController.ConnectToLoginServer(function () {
                    NetWorkController.Send('msg.C2L_ReqLoginWechat', loginInfo);
                }.bind(this));
            }
        ], function (err) {
            if (err) {
                console.log(err);
            }
        });
    },
    SendUserInfo: function () {
        console.log('Platform SendUserInfo');
        async.waterfall([
            function (anext) {
                wx.getUserInfo({
                    lang: 'zh_CN',
                    success: function (res) {
                        anext(null, res.userInfo);
                    },
                    fail: function (err) {
                        anext(err);
                    }
                });
            },
            function (data, anext) {
                UserModel.loginInfo.nickname = data.nickName;
                UserModel.loginInfo.face = data.avatarUrl;
                NotificationController.Emit(Define.EVENT_KEY.USERINFO_UPDATEUSER);
                NetWorkController.Send('msg.C2GW_UpdateUserInfo', { name: data.nickName, face: data.avatarUrl });
                anext(null);
            }
        ], function (err) {
            if (err) {
                console.log(err);
            }
        });
    },
    ShareMessage: function (sharetype, shareid, time) {
        let sharedefine = ActiveController.GetShareDefine(sharetype, shareid);
        let image = _.get(sharedefine, 'Image', 'images/share/image_share.png');
        ActiveController._sharetype = sharetype;
        ActiveController._shareid = shareid;
        ActiveController._sharetime = time;
        ActiveController._sharing = true;
        wx.shareAppMessage({
            title: _.get(sharedefine, 'Title', '后宫纪，给你不一样的后宫'),
            imageUrl: 'https://gongdou.giantfun.cn/' + image,
        });
    },
    RequestPay: function (payment) {
        wx.requestMidasPayment({
            mode: 'game',
            env: 1,
            offerId: 1450017078,
            currencyType: 'CNY',
            platform: 'android',
            buyQuantity: payment,
            zoneId: 1,
            success: function () {
                NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, '充值成功');
                NetWorkController.Send('msg.C2GW_PlatformRechargeDone', {});
            },
            fail: function (info) {
                NotificationController.Emit(Define.EVENT_KEY.TIP_TIPS, info.errCode);
            }
        });
    },
    SetStorage: function (key, value) {
        wx.setStorageSync(key, value);
    },
    GetStorage: function (key) {
        return wx.getStorageSync(key);
    }
})

module.exports = WechatPlatform;