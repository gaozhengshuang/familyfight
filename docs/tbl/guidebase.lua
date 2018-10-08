// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var Guide : table.IGuideDefine[] = [
		{ Id : 1, NextGuide : 2, Type : 0, IsFinger : 1, Dialog : "欢迎来到宫斗攻略！我们先打开轿子获取一个宫女。", prefab : "", ButtonName : "" 	},
		{ Id : 2, NextGuide : 3, Type : 0, IsFinger : 1, Dialog : "再次打开轿子获取第二个宫女。", prefab : "", ButtonName : "" 	},
		{ Id : 3, NextGuide : 4, Type : 0, IsFinger : 0, Dialog : "当有两个一样宫女以后，可以用手把两个宫女拖到一起，合并升级宫女。", prefab : "", ButtonName : "" 	},
		{ Id : 4, NextGuide : 5, Type : 1, IsFinger : 1, Dialog : "觉得合成宫女太累了？没关系，我们可以点击打开商店，购买宫女。", prefab : "Prefab/GameSceneView", ButtonName : "btn_shop" 	},
		{ Id : 5, NextGuide : 6, Type : 1, IsFinger : 1, Dialog : "点击购买宫女就可以直接获得一个宫女。", prefab : "Prefab/shopCellNode", ButtonName : "button_buy" 	},
		{ Id : 6, NextGuide : 7, Type : 1, IsFinger : 1, Dialog : "再次购买一个宫女吧。", prefab : "Prefab/shopCellNode", ButtonName : "button_buy" 	},
		{ Id : 7, NextGuide : 8, Type : 0, IsFinger : 0, Dialog : "我们把刚买的两个宫女合并升级。", prefab : "", ButtonName : "" 	},
		{ Id : 8, NextGuide : 9, Type : 0, IsFinger : 0, Dialog : "让我们接着合并升级宫女，可以开启新的地图。", prefab : "", ButtonName : "" 	},
		{ Id : 9, NextGuide : 10, Type : 1, IsFinger : 1, Dialog : "刚才的宫女去哪里了？让我们点击按钮来切换地图找她。", prefab : "Prefab/PassCellNode", ButtonName : "PassCellNode" 	},
		{ Id : 10, NextGuide : 11, Type : 1, IsFinger : 1, Dialog : "解锁了翻牌子，请点击打开看看。", prefab : "Prefab/GameSceneView", ButtonName : "btn_turnbrand" 	},
		{ Id : 11, NextGuide : 12, Type : 1, IsFinger : 1, Dialog : "尝试点击翻牌子，可以获取更多金币。（获得的金币数跟你拥有的宫女等级数量有关）", prefab : "Prefab/TurnBrandView", ButtonName : "BrandNodeParent4" 	},
		{ Id : 12, NextGuide : 13, Type : 1, IsFinger : 1, Dialog : "运气真好！获得了很多钱，让我们返回去继续升级宫女吧。", prefab : "Prefab/TurnBrandView", ButtonName : "BackButton" 	},
		{ Id : 13, NextGuide : 0, Type : 2, IsFinger : 0, Dialog : "让我们接着解锁新的关卡，可以开启新的功能。", prefab : "", ButtonName : "" 	}
	]


// Id
export var GuideById : game.Dictionary<table.IGuideDefine> = {}
function readGuideById(){
  for(let rec of Guide) {
    GuideById[rec.Id] = rec; 
  }
}
readGuideById();
}

