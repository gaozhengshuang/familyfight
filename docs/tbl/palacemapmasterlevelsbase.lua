// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var PalaceMapMasterLevels : table.IPalaceMapMasterLevelsDefine[] = [
		{ Id : 1, MasterId : 41, Level : 1, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "贵人" 	},
		{ Id : 2, MasterId : 41, Level : 2, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "嫔" 	},
		{ Id : 3, MasterId : 41, Level : 3, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "妃" 	},
		{ Id : 4, MasterId : 41, Level : 4, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "贵妃" 	},
		{ Id : 5, MasterId : 41, Level : 5, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "皇贵妃" 	},
		{ Id : 6, MasterId : 41, Level : 6, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "皇后" 	},
		{ Id : 7, MasterId : 40, Level : 1, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "贵人" 	},
		{ Id : 8, MasterId : 40, Level : 2, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "嫔" 	},
		{ Id : 9, MasterId : 40, Level : 3, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "妃" 	},
		{ Id : 10, MasterId : 40, Level : 4, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "贵妃" 	},
		{ Id : 11, MasterId : 40, Level : 5, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "皇贵妃" 	},
		{ Id : 12, MasterId : 40, Level : 6, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "皇后" 	},
		{ Id : 13, MasterId : 39, Level : 1, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "贵人" 	},
		{ Id : 14, MasterId : 39, Level : 2, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "嫔" 	},
		{ Id : 15, MasterId : 39, Level : 3, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "妃" 	},
		{ Id : 16, MasterId : 39, Level : 4, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "贵妃" 	},
		{ Id : 17, MasterId : 39, Level : 5, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "皇贵妃" 	},
		{ Id : 18, MasterId : 39, Level : 6, LevelupCost : [ "10001_1" ], WaitTime : 30, levelName : "皇后" 	}
	]


// Id
export var PalaceMapMasterLevelsById : game.Dictionary<table.IPalaceMapMasterLevelsDefine> = {}
function readPalaceMapMasterLevelsById(){
  for(let rec of PalaceMapMasterLevels) {
    PalaceMapMasterLevelsById[rec.Id] = rec; 
  }
}
readPalaceMapMasterLevelsById();
}

