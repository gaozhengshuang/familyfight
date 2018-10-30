package table

type Common struct {
	ActiveRecordCount     int64       `json:"ActiveRecordCount"`
	AttackPalaceReward    int64       `json:"AttackPalaceReward"`
	EventBarrageCount     int64       `json:"EventBarrageCount"`
	GoldItemID            int64       `json:"GoldItemId"`
	GuessKingCount        int64       `json:"GuessKingCount"`
	GuessKingLoseReward   int64       `json:"GuessKingLoseReward"`
	GuessKingWinReward    int64       `json:"GuessKingWinReward"`
	KickAssLoseReward     Common_sub1 `json:"KickAssLoseReward"`
	KickAssWinReward      Common_sub1 `json:"KickAssWinReward"`
	LinkupGoldRewardRatio int64       `json:"LinkupGoldRewardRatio"`
	LinkupLoseReward      int64       `json:"LinkupLoseReward"`
	LinkupWinReward       int64       `json:"LinkupWinReward"`
	LuckilyReward         int64       `json:"LuckilyReward"`
	PowerAddInterval      int64       `json:"PowerAddInterval"`
	PowerAddition         int64       `json:"PowerAddition"`
	PowerInit             int64       `json:"PowerInit"`
	PowerMax              int64       `json:"PowerMax"`
	PriceAdditionPerBuy   float64     `json:"PriceAdditionPerBuy"`
	RobotCount            int64       `json:"RobotCount"`
	RobotGenerateInterval int64       `json:"RobotGenerateInterval"`
	TenSeceondLoseRatio   Common_sub1 `json:"TenSeceondLoseRatio"`
	TenSecondWinReward    Common_sub2 `json:"TenSecondWinReward"`
	TravelMaxTime         int64       `json:"TravelMaxTime"`
	TravelMinTime         int64       `json:"TravelMinTime"`
	临幸奖励                  string      `json:"临幸奖励"`
	互动记录保留条数              string      `json:"互动记录保留条数"`
	十秒小游戏失败奖励             string      `json:"十秒小游戏失败奖励"`
	十秒小游戏成功奖励             string      `json:"十秒小游戏成功奖励"`
	攻击后宫成功奖励系数            string      `json:"攻击后宫成功奖励系数"`
	猜皇帝失败奖励               string      `json:"猜皇帝失败奖励"`
	猜皇帝成功奖励               string      `json:"猜皇帝成功奖励"`
	猜皇帝数量                 string      `json:"猜皇帝数量"`
	踢屁股失败奖励系数             string      `json:"踢屁股失败奖励系数"`
	踢屁股成功奖励金币系数           string      `json:"踢屁股成功奖励金币系数"`
	连连看金币奖励系数id           string      `json:"连连看金币奖励系数id"`
}

type Common_sub2 struct {
	Gold int64     `json:"Gold"`
	Item [][]int64 `json:"Item"`
}

type Common_sub1 struct {
	Gold int64 `json:"Gold"`
}
