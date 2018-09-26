const _ = require('lodash');
const moment = require('moment');

let Tools = {
    GetRandomInt: function (min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },
    GetRandomResult: function () {
        return Math.random() < 0.5;
    },
    CheckParams: function (obj, params) {
        var lostParams = [];
        for (var i = 0; i < params.length; i++) {
            if (obj[params[i]] == null) {
                lostParams.push(params[i]);
            }
        }
        return lostParams;
    },
    GetValueInObj: function (obj, key) {
        let keys = key.split('.');
        let source = obj;
        for (let i = 0; i < keys.length; i++) {
            if (source == null) {
                return null;
            }
            source = source[keys[i]];
        }
        return source;
    },
    SetValueInObj: function (obj, key, value) {
        let keys = key.split('.');
        let pre = obj;
        let nextKey = '';
        for (let i = 0; i < keys.length; i++) {
            if (i != 0) {
                pre = pre[nextKey];
            }
            nextKey = keys[i];
            if (pre[nextKey] == null) {
                return false;
            }
        }
        pre[nextKey] = value;
    },
    GetValuesInArray: function (arr, key) {
        if (_.isArray(arr)) {
            let ret = [];
            for (let i = 0; i < arr.length; i++) {
                let obj = arr[i];
                ret.push(Tools.GetValueInObj(obj, key));
            }
            return ret;
        }
        return [];
    },
    GetRandomString: function (len) {
        len = len || 32;
        var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
        var maxPos = $chars.length;
        var pwd = '';
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    },
    InvokeCallback: function (cb) {
        if (_.isFunction(cb)) {
            cb.apply(null, Array.prototype.slice.call(arguments, 1));
            return true;
        }
        return false;
    },
    GetMilliSecond: function () {
        return moment().unix() * 1000 + moment().milliseconds();
    },
    CalculateCouponStr: function (value) {
        let coupon = _.isString(value) ? parseInt(value) : value;
        let info = null;
        if (coupon > 9999) {
            let ret = (coupon / 1000).toFixed(2);
            ret = ret == Math.floor(ret) ? Math.floor(ret) : ret;
            info = { num: ret, suffix: 'k' };
        } else {
            info = { num: coupon, suffix: '' };
        }
        return info;
    },
    AutoFit: function (canvas) {
        let designResolution = canvas.designResolution
        var viewSize = cc.view.getFrameSize()
        if (viewSize.width / viewSize.height > designResolution.width / designResolution.height) {
            canvas.fitHeight = true;
            canvas.fitWidth = false;
        }
        else {
            canvas.fitHeight = false;
            canvas.fitWidth = true
        }
    },
    ObjectLength: function (obj) {
        if (_.isObject(obj)) {
            return _.keys(obj).length;
        }
        return 0;
    },
    UnitConvert(num) {
        let moneyUnits = ["", "万", "亿", "兆", "京", "垓", "秭", "穰", "沟", "涧", "正", "载", "极"]; 
        let dividend = 10000;
        let curentNum = num; //转换数字 
        let curentUnit = moneyUnits[0]; //转换单位 

        for (let i = 0; i < moneyUnits.length; i ++) { 
            curentUnit = moneyUnits[i];
            if(Math.floor(curentNum/dividend) <= 0 || i >= moneyUnits.length - 1) { break; }
            curentNum = curentNum / dividend;
        }

        return this.toDecimal(curentNum) + curentUnit;
    },
    toDecimal(x) {
        var f = parseFloat(x);
        if (isNaN(f)) {
            return;
        }
        f = Math.round(x*100)/100;
        return f;
    },
}

module.exports = Tools;