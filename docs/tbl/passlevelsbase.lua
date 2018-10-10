// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var PassLevels : table.IPassLevelsDefine[] = [
		{ Id : 1, Name : "选秀女", Path : "Image/GameScene/Pass/pass_1", NextLevels : 2, DialogueID : 0, MapPrefab : "Prefab/map/map05", ChapterID : 1, ChapterName : "第一章", Index : 1 	},
		{ Id : 2, Name : "步步生莲", Path : "Image/GameScene/Pass/pass_7", NextLevels : 3, DialogueID : 0, MapPrefab : "Prefab/map/map01", ChapterID : 1, ChapterName : "第一章", Index : 2 	},
		{ Id : 3, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 4, DialogueID : 33, MapPrefab : "Prefab/map/map03", ChapterID : 1, ChapterName : "第一章", Index : 3 	},
		{ Id : 4, Name : "皇后千秋", Path : "Image/GameScene/Pass/pass_4", NextLevels : 5, DialogueID : 7, MapPrefab : "Prefab/map/map02", ChapterID : 1, ChapterName : "第一章", Index : 4 	},
		{ Id : 5, Name : "初入长春宫", Path : "Image/GameScene/Pass/pass_5", NextLevels : 6, DialogueID : 25, MapPrefab : "Prefab/map/map06", ChapterID : 2, ChapterName : "第二章", Index : 1 	},
		{ Id : 6, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 7, DialogueID : 33, MapPrefab : "Prefab/map/map05", ChapterID : 2, ChapterName : "第二章", Index : 2 	},
		{ Id : 7, Name : "泼水", Path : "Image/GameScene/Pass/pass_3", NextLevels : 8, DialogueID : 25, MapPrefab : "Prefab/map/map04", ChapterID : 2, ChapterName : "第二章", Index : 3 	},
		{ Id : 8, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 9, DialogueID : 33, MapPrefab : "Prefab/map/map03", ChapterID : 2, ChapterName : "第二章", Index : 4 	},
		{ Id : 9, Name : "皇后千秋", Path : "Image/GameScene/Pass/pass_4", NextLevels : 10, DialogueID : 7, MapPrefab : "Prefab/map/map02", ChapterID : 3, ChapterName : "第三章", Index : 1 	},
		{ Id : 10, Name : "绣女", Path : "Image/GameScene/Pass/pass_1", NextLevels : 11, DialogueID : 1, MapPrefab : "Prefab/map/map01", ChapterID : 3, ChapterName : "第三章", Index : 2 	},
		{ Id : 11, Name : "作弊", Path : "Image/GameScene/Pass/pass_2", NextLevels : 12, DialogueID : 33, MapPrefab : "Prefab/map/map04", ChapterID : 3, ChapterName : "第三章", Index : 3 	},
		{ Id : 12, Name : "皇后千秋", Path : "Image/GameScene/Pass/pass_4", NextLevels : 13, DialogueID : 7, MapPrefab : "Prefab/map/map05", ChapterID : 3, ChapterName : "第三章", Index : 4 	},
		{ Id : 13, Name : "初入长春宫", Path : "Image/GameScene/Pass/pass_5", NextLevels : 0, DialogueID : 25, MapPrefab : "Prefab/map/map06", ChapterID : 4, ChapterName : "第四章", Index : 1 	}
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

