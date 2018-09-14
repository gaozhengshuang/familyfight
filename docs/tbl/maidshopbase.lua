// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var TMaidShop : table.ITMaidShopDefine[] = [
		{ Id : 1, Price : 10 	},
		{ Id : 2, Price : 20 	},
		{ Id : 3, Price : 40 	},
		{ Id : 4, Price : 80 	},
		{ Id : 5, Price : 160 	},
		{ Id : 6, Price : 320 	},
		{ Id : 7, Price : 640 	},
		{ Id : 8, Price : 1280 	},
		{ Id : 9, Price : 2560 	},
		{ Id : 10, Price : 5120 	},
		{ Id : 11, Price : 10240 	},
		{ Id : 12, Price : 20480 	},
		{ Id : 13, Price : 40960 	},
		{ Id : 14, Price : 81920 	},
		{ Id : 15, Price : 163840 	},
		{ Id : 16, Price : 327680 	},
		{ Id : 17, Price : 655360 	},
		{ Id : 18, Price : 1310720 	},
		{ Id : 19, Price : 2621440 	}
	]


// Id
export var TMaidShopById : game.Dictionary<table.ITMaidShopDefine> = {}
function readTMaidShopById(){
  for(let rec of TMaidShop) {
    TMaidShopById[rec.Id] = rec; 
  }
}
readTMaidShopById();
}

