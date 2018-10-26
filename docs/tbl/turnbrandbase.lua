// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var TurnBrand : table.ITurnBrandDefine[] = [
		{ Id : 1, Name : "皇上", Head : "Image/Head/2_round", Reward : 11001, Dialogue : 0, Weight : 50 	},
		{ Id : 2, Name : "皇后", Head : "Image/Head/1_round", Reward : 12001, Dialogue : 14, Weight : 50 	},
		{ Id : 3, Name : "侍卫", Head : "Image/Head/5_round", Reward : 13001, Dialogue : 0, Weight : 50 	},
		{ Id : 4, Name : "贵妃", Head : "Image/Head/4_round", Reward : 14001, Dialogue : 0, Weight : 50 	},
		{ Id : 5, Name : "太监", Head : "Image/Head/3_round", Reward : 15001, Dialogue : 0, Weight : 0 	},
		{ Id : 6, Name : "御医", Head : "Image/Head/6_round", Reward : 16001, Dialogue : 0, Weight : 0 	}
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

