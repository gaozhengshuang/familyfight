let Game = {
    async: require('async'),
    moment: require('moment'),
    _: require('lodash'),
    bigInteger: require('big-integer'),

    Define: require('./Util/Define'),
    UIName: require('./Util/UIName'),
    TurnGameDefine: require('./Util/TurnGameDefine'),
    Tools: require('./Util/Tools'),
    HttpUtil: require('./Util/HttpUtil'),
    Crypto: require('./Util/Crypto'),
    ProtoMsg: require('./Util/ProtoMsg'),

    Platform: require('./Platform/CommonGame'),

    AudioController: require('./Controller/AudioController'),
    ConfigController: require('./Controller/ConfigController'),
    GameController: require('./Controller/GameController'),
    LoginController: require('./Controller/LoginController'),
    NetWorkController: require('./Controller/NetWorkController'),
    NotificationController: require('./Controller/NotificationController'),
    ResController: require('./Controller/ResController'),
    TimeController: require('./Controller/TimeController'),
    ViewController: require('./Controller/ViewController'),
    GuideController: require('./Controller/GuideController'),
    RewardController: require('./Controller/RewardController'),

    UserModel: require('./Model/User'),
    MaidModel: require('./Model/Maid'),
    CurrencyModel: require('./Model/Currency'),
    PalaceModel: require('./Model/Palace'),
    ItemModel: require('./Model/Item'),
    TravelModel: require('./Model/Travel'),
    BoxModel: require('./Model/Box'),
    MiniGameModel: require('./Model/MiniGame'),

    GameInstance: null
};

if (cc.sys.platform == cc.sys.WECHAT_GAME) {
    Game.Platform = require('./Platform/WechatGame');
}

module.exports = Game;

