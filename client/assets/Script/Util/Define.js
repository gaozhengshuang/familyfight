var Define = {
    Regex: {
        url: '((http|ftp|https)://)(([a-zA-Z0-9\._-]+\.[a-zA-Z]{2,6})|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,4})*(/[a-zA-Z0-9\&%_\./-~-]*)?',
        mail: '^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$',
    },
    EVENT_KEY: {
        CHANGE_GAMESTATE: '0',
        LOADED_COMPLETE: '5',

        CONNECT_TO_GATESERVER: '100',

        USERINFO_UPDATECOINS: '200',
        USERINFO_UPDATEITEMS: '201',
        USERINFO_ADDGOLD: '202',
        USERINFO_SUBTRACTGOLD: '203',

        NET_OPEN: '300',
        NET_CLOSE: '301',

        TIP_TIPS: '401',
        TIP_REWARD: '402',
        TIP_PLAYGOLDFLY: '403',

        MUSIC_CHANGE: '500',
        EFFECT_CHANGE: '501',

        USERINFO_UPDATEGOLD: '600',
        USERINFO_UPDATEPASS: '601',
        MAID_UPDATESHOP: '602',
        USERINFO_UPDATEPOWER: '603',

        MERGE_PLAYER: '1001',
        ADD_PLAYER: '1002',
        UPDATE_GAMEVIEW: '1003',
        MERGEPLAYER_ACK: '1004',
        FINDNEW_PLAYER: '1005',
        SHOWDIALOGUE_PLAYER: '1006',
        PALACEDATA_ACK: '1007',
        PALACEMAID_UNLOCK: '1008',
        PALACETASK_ACK: '1009',
        PALACEMASTERLVUP_ACK: '1010',
        OFFLINE_ACK: '1011',
        OPENBOX_ACK: '1012',
        BOXDATA_UPDATE: '1013',
        GUIDE_ACK: '1014',
        GUIDE_OPEN: '1015',
        GUIDE_OVER: '1016',
        UPDATE_PLAYER: '1017',

        TRAVELDATA_UPDATE: '1100',
        EVENTDATA_UPDATE: '1101',
        SUPPLYPREPARE_ACK: '1102',
    },
    DATA_KEY: {
        HISTORY_PHONE: '1',
        DISABLE_MUSIC: '2',
        DISABLE_EFFECT: '3'
    },
    HEART_BEAT: {
        INTERVAL: 10,
        TIMEOUT: 30,
    },
    ITEM_TYPE: {
        TYPE_PALACECARD: 1,
        TYPE_TRAVELFOOD: 2,
        TYPE_TRAVELGOOD: 3,
        TYPE_TRAVELCLOTH: 4,
        TYPE_GOLD: 5
    },
    GUIDE_DEFINE: {
        OPEN_TURNBRAND: 15,
        CLICK_TURNBRAND: 16,
        SHOW_TURNBRANDREWARD: 17,
        CLOSE_TURNBRAND: 18,
        BUTTON_OPENSHOP: 6,
        BUTTON_OPENTURNBRAND: 15,
        BUTTON_OPENPALACE: 19
    },
    FUNCTION_UNLOCK: {
        SHOP: 1,
        TURNBRAND: 2,
        PALACE: 3,
        BESTOWED: 4,
        HANDBOOK: 5,
        BUILD: 6,
        RANDOMX: 7,
        FAVORITISM: 8
    },
}

module.exports = Define;

//pbjs -t static-module -w commonjs -o ./ProtoMsg.js  *.proto