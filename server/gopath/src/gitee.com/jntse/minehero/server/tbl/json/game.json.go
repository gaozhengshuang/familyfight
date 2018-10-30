package table

type Game struct {
	_               string    `json:"//"`
	FreePresentRule Game_sub1 `json:"FreePresentRule"`
	LuckDrawPrice   int64     `json:"LuckDrawPrice"`
}

type Game_sub1 struct {
	Count        int64 `json:"Count"`
	FloorTrigger int64 `json:"FloorTrigger"`
	Money        int64 `json:"Money"`
}
