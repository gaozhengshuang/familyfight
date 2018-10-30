package table

type Global struct {
	_                 string        `json:"//"`
	Delivery          Global_sub1   `json:"Delivery"`
	HongBaoAPI        Global_sub2   `json:"HongBaoAPI"`
	HongBaoAPITest    Global_sub2   `json:"HongBaoAPITest"`
	IntranetFlag      bool          `json:"IntranetFlag"`
	PickYuanbaoNotice int64         `json:"PickYuanbaoNotice"`
	PresentFreeStep   int64         `json:"PresentFreeStep"`
	RechargeCallback  string        `json:"RechargeCallback"`
	Sms               Global_sub3   `json:"Sms"`
	WechatMiniGame    Global_sub4   `json:"WechatMiniGame"`
	Bool              bool          `json:"bool"`
	Disconclean       int64         `json:"disconclean"`
	Float             float64       `json:"float"`
	Gamemaxmember     int64         `json:"gamemaxmember"`
	Gamerewardper     int64         `json:"gamerewardper"`
	Gamerobotnum      int64         `json:"gamerobotnum"`
	Gameroundcount    int64         `json:"gameroundcount"`
	Gameroundtime     int64         `json:"gameroundtime"`
	Gametype          []int64       `json:"gametype"`
	Gamewaittime      int64         `json:"gamewaittime"`
	Hearbeat          Global_sub5   `json:"hearbeat"`
	Int               int64         `json:"int"`
	IntArray          []int64       `json:"intArray"`
	Newuser           Global_sub6   `json:"newuser"`
	ObjArray          []Global_sub7 `json:"objArray"`
	StrArray          []string      `json:"strArray"`
	String            string        `json:"string"`
}

type Global_sub3 struct {
	Account         string `json:"Account"`
	AuthCodeContent string `json:"AuthCodeContent"`
	Passwd          string `json:"Passwd"`
	URLAPI          string `json:"UrlAPI"`
}

type Global_sub4 struct {
	AppID          string `json:"AppId"`
	AppSecret      string `json:"AppSecret"`
	Jscode2Session string `json:"Jscode2Session"`
}

type Global_sub2 struct {
	Battles           string `json:"Battles"`
	CharacterCreation string `json:"CharacterCreation"`
	CharacterLevel    string `json:"CharacterLevel"`
	CheckWechatBound  string `json:"CheckWechatBound"`
	ConsumeMoney      string `json:"ConsumeMoney"`
	DecrCoins         string `json:"DecrCoins"`
	FinanceQuery      string `json:"FinanceQuery"`
	IncrDiamonds      string `json:"IncrDiamonds"`
	IncrGolds         string `json:"IncrGolds"`
	LootMoney         string `json:"LootMoney"`
	Online            string `json:"Online"`
	Victory           string `json:"Victory"`
	Getaddress        string `json:"getaddress"`
	Key               string `json:"key"`
	Recharge          string `json:"recharge"`
	Secret            string `json:"secret"`
}

type Global_sub1 struct {
	Cost           int64  `json:"Cost"`
	Dev            string `json:"Dev"`
	Freelimit      int64  `json:"Freelimit"`
	GameID         string `json:"GameId"`
	URLAPI         string `json:"UrlAPI"`
	URLAPIJump     string `json:"UrlAPIJump"`
	URLAPIJumpTest string `json:"UrlAPIJumpTest"`
}

type Global_sub6 struct {
	Coupon  int64 `json:"coupon"`
	Yuanbao int64 `json:"yuanbao"`
}

type Global_sub7 struct {
	Item int64  `json:"item"`
	Name string `json:"name"`
}

type Global_sub5 struct {
	Timeout int64 `json:"timeout"`
}
