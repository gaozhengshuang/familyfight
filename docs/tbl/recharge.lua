// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var TRecharge : table.ITRechargeDefine[] = [
		{ Id : 1, Price : 6, Info : "6元" 	},
		{ Id : 2, Price : 30, Info : "30元" 	},
		{ Id : 3, Price : 98, Info : "98元" 	},
		{ Id : 4, Price : 128, Info : "128元" 	},
		{ Id : 5, Price : 348, Info : "348元" 	},
		{ Id : 6, Price : 648, Info : "648元" 	}
	]


// Id
export var TRechargeById : game.Dictionary<table.ITRechargeDefine> = {}
function readTRechargeById(){
  for(let rec of TRecharge) {
    TRechargeById[rec.Id] = rec; 
  }
}
readTRechargeById();
}
