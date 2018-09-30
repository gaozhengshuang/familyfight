// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var PassLevels : table.IPassLevelsDefine[] = [
		{ Id : 1, Name : "绣女", Path : "Image/GameScene/Pass/pass_1", NextLevels : 2, DialogueID : 1, MapPrefab : "Prefab/map/map01", ChapterID : 1, ChapterName : "第一章" 	},
		{ Id : 2, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 3, DialogueID : 33, MapPrefab : "Prefab/map/map03", ChapterID : 1, ChapterName : "第一章" 	},
		{ Id : 3, Name : "皇后千秋", Path : "Image/GameScene/Pass/pass_4", NextLevels : 4, DialogueID : 7, MapPrefab : "Prefab/map/map02", ChapterID : 1, ChapterName : "第一章" 	},
		{ Id : 4, Name : "初入长春宫", Path : "Image/GameScene/Pass/pass_5", NextLevels : 5, DialogueID : 25, MapPrefab : "Prefab/map/map06", ChapterID : 1, ChapterName : "第一章" 	},
		{ Id : 5, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 6, DialogueID : 33, MapPrefab : "Prefab/map/map05", ChapterID : 2, ChapterName : "第二章" 	},
		{ Id : 6, Name : "泼水", Path : "Image/GameScene/Pass/pass_3", NextLevels : 7, DialogueID : 25, MapPrefab : "Prefab/map/map04", ChapterID : 2, ChapterName : "第二章" 	},
		{ Id : 7, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 8, DialogueID : 33, MapPrefab : "Prefab/map/map03", ChapterID : 2, ChapterName : "第二章" 	},
		{ Id : 8, Name : "皇后千秋", Path : "Image/GameScene/Pass/pass_4", NextLevels : 9, DialogueID : 7, MapPrefab : "Prefab/map/map02", ChapterID : 2, ChapterName : "第二章" 	},
		{ Id : 9, Name : "绣女", Path : "Image/GameScene/Pass/pass_1", NextLevels : 10, DialogueID : 1, MapPrefab : "Prefab/map/map01", ChapterID : 3, ChapterName : "第三章" 	},
		{ Id : 10, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 11, DialogueID : 33, MapPrefab : "Prefab/map/map04", ChapterID : 3, ChapterName : "第三章" 	},
		{ Id : 11, Name : "皇后千秋", Path : "Image/GameScene/Pass/pass_4", NextLevels : 12, DialogueID : 7, MapPrefab : "Prefab/map/map05", ChapterID : 3, ChapterName : "第三章" 	},
		{ Id : 12, Name : "初入长春宫", Path : "Image/GameScene/Pass/pass_5", NextLevels : 0, DialogueID : 25, MapPrefab : "Prefab/map/map06", ChapterID : 3, ChapterName : "第三章" 	}
	]


// Id
export var PassLevelsById : game.Dictionary<table.IPassLevelsDefine> = {}
function readPassLevelsById(){
  for(let rec of PassLevels) {
    PassLevelsById[rec.Id] = rec; 
  }
}
readPassLevelsById();
}

