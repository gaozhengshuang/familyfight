package table

type Common struct {
	ActiveRecordCount     int64         `json:"ActiveRecordCount"`
	AttackPalaceReward    int64         `json:"AttackPalaceReward"`
	DailyPower            Common_sub2   `json:"DailyPower"`
	EventBarrageCount     int64         `json:"EventBarrageCount"`
	GoldItemID            int64         `json:"GoldItemId"`
	GuessKingCount        int64         `json:"GuessKingCount"`
	GuessKingLoseReward   int64         `json:"GuessKingLoseReward"`
	GuessKingWinReward    int64         `json:"GuessKingWinReward"`
	KickAssLoseReward     int64         `json:"KickAssLoseReward"`
	KickAssWinReward      int64         `json:"KickAssWinReward"`
	LinkupGoldRewardRatio int64         `json:"LinkupGoldRewardRatio"`
	LinkupLoseReward      int64         `json:"LinkupLoseReward"`
	LinkupWinReward       int64         `json:"LinkupWinReward"`
	LuckilyReward         int64         `json:"LuckilyReward"`
	PowerAddInterval      int64         `json:"PowerAddInterval"`
	PowerAddition         int64         `json:"PowerAddition"`
	PowerInit             int64         `json:"PowerInit"`
	PowerMax              int64         `json:"PowerMax"`
	PriceAdditionPerBuy   float64       `json:"PriceAdditionPerBuy"`
	RobotCount            int64         `json:"RobotCount"`
	RobotGenerateInterval int64         `json:"RobotGenerateInterval"`
	Signin                []Common_sub3 `json:"Signin"`
	TenSeceondLoseRatio   int64         `json:"TenSeceondLoseRatio"`
	TenSecondWinReward    int64         `json:"TenSecondWinReward"`
	TravelMaxTime         int64         `json:"TravelMaxTime"`
	TravelMinTime         int64         `json:"TravelMinTime"`
	临幸奖励                  string        `json:"临幸奖励"`
	互动记录保留条数              string        `json:"互动记录保留条数"`
	十秒小游戏失败奖励             string        `json:"十秒小游戏失败奖励"`
	十秒小游戏成功奖励             string        `json:"十秒小游戏成功奖励"`
	攻击后宫成功奖励系数            string        `json:"攻击后宫成功奖励系数"`
	每日体力                  string        `json:"每日体力"`
	猜皇帝失败奖励               string        `json:"猜皇帝失败奖励"`
	猜皇帝成功奖励               string        `json:"猜皇帝成功奖励"`
	猜皇帝数量                 string        `json:"猜皇帝数量"`
	签到                    string        `json:"签到"`
	踢屁股失败奖励系数             string        `json:"踢屁股失败奖励系数"`
	踢屁股成功奖励金币系数           string        `json:"踢屁股成功奖励金币系数"`
	连连看金币奖励系数id           string        `json:"连连看金币奖励系数id"`
}

type Common_sub3 struct {
	Desc   string `json:"Desc"`
	Icon   string `json:"Icon"`
	Reward int64  `json:"Reward"`
}

type Common_sub1 struct {
	MaxTime int64 `json:"MaxTime"`
	MinTime int64 `json:"MinTime"`
}

type Common_sub2 struct {
	Reward int64         `json:"Reward"`
	Time   []Common_sub1 `json:"Time"`
}
