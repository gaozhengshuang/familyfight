let CryptoJS = require("crypto-js");

let Crypto = {
    AESEncrypt: function (key, iv, word) {
        // let srcs = CryptoJS.enc.Utf8.parse(word);
        // let encrypted = CryptoJS.AES.encrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, paaing: CryptoJS.pad.Pkcs7 });
        // return encrypted.ciphertext.toString().toUpperCase();
        var encrypted = CryptoJS.AES.encrypt(data, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        return encrypted.toString();
    },
    AESDecrypt: function (key, iv, word) {
        var decrypted = CryptoJS.AES.decrypt(word, key, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        decrypted = CryptoJS.enc.Utf8.stringify(decrypted);// 转换为 utf8 字符串
        return decrypted;
        // let encryptedHexStr = CryptoJS.enc.Hex.parse(word);
        // let srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
        // let decrypt = CryptoJS.AES.decrypt(srcs, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        // let decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        // return decryptedStr.toString();
    }
}

module.exports = Crypto;