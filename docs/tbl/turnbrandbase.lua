// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var TurnBrand : table.ITurnBrandDefine[] = [
		{ Id : 1, Name : "皇上", Head : "Image/Head/2_round", Type : 5, RewardId : 1, Value : 1, Dialogue : 0, Weight : 50 	},
		{ Id : 2, Name : "皇后", Head : "Image/Head/1_round", Type : 2, RewardId : 0, Value : 10, Dialogue : 14, Weight : 10 	},
		{ Id : 3, Name : "侍卫", Head : "Image/Head/5_round", Type : 1, RewardId : 0, Value : 500, Dialogue : 0, Weight : 30 	},
		{ Id : 4, Name : "贵妃", Head : "Image/Head/4_round", Type : 1, RewardId : 0, Value : 1000, Dialogue : 0, Weight : 20 	},
		{ Id : 5, Name : "太监", Head : "Image/Head/3_round", Type : 1, RewardId : 0, Value : 200, Dialogue : 0, Weight : 80 	},
		{ Id : 6, Name : "太医", Head : "Image/Head/6_round", Type : 1, RewardId : 0, Value : 300, Dialogue : 0, Weight : 60 	}
	]


// Id
export var TurnBrandById : game.Dictionary<table.ITurnBrandDefine> = {}
function readTurnBrandById(){
  for(let rec of TurnBrand) {
    TurnBrandById[rec.Id] = rec; 
  }
}
readTurnBrandById();
}

