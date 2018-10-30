package table

type Room struct {
	_                      string      `json:"//"`
	DiamondToCoins         int64       `json:"diamond_to_coins"`
	DiamondpartsToCoins    int64       `json:"diamondparts_to_coins"`
	DiamondpartsToDiamond  int64       `json:"diamondparts_to_diamond"`
	Diamondroom            []Room_sub1 `json:"diamondroom"`
	Griditem               Room_sub2   `json:"griditem"`
	MustBeOutDiamondStep   int64       `json:"must_be_out_diamond_step"`
	Rebate                 Room_sub6   `json:"rebate"`
	RmbToConis             int64       `json:"rmb_to_conis"`
	RmbToYuanbao           int64       `json:"rmb_to_yuanbao"`
	StepDiamondProbability []Room_sub7 `json:"step_diamond_probability"`
}

type Room_sub2 struct {
	CouponRate      int64 `json:"CouponRate"`
	FreeYuanbaoRate int64 `json:"FreeYuanbaoRate"`
	ItemRate        int64 `json:"ItemRate"`
	YuanbaoRate     int64 `json:"YuanbaoRate"`
}

type Room_sub3 struct {
	Diamond int64 `json:"diamond"`
	Empty   int64 `json:"empty"`
	Parts   int64 `json:"parts"`
}

type Room_sub4 struct {
	Diamond int64 `json:"diamond"`
	Parts   int64 `json:"parts"`
}

type Room_sub1 struct {
	Grade   int64  `json:"grade"`
	Num     int64  `json:"num"`
	Pickpro string `json:"pickpro"`
	Total   int64  `json:"total"`
}

type Room_sub6 struct {
	GroupGird      Room_sub5 `json:"group_gird"`
	MinConsume     int64     `json:"min_consume"`
	WarningLineMax int64     `json:"warning_line_max"`
	WarningLineMin int64     `json:"warning_line_min"`
}

type Room_sub5 struct {
	HaveEmptyPartsDiamond Room_sub3 `json:"have_empty_parts_diamond"`
	HavePartsDiamond      Room_sub4 `json:"have_parts_diamond"`
}

type Room_sub7 struct {
	Pro  int64 `json:"pro"`
	Step int64 `json:"step"`
}
