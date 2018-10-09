// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var Guide : table.IGuideDefine[] = [
		{ Id : 1, NextGuide : 2, Type : 3, IsDialog : 1, IsFinger : 1, Dialog : "欢迎来到后宫！我们先打开轿子获取一个宫女。", prefab : "", ButtonName : "", PersonXY : "0,429", FingerXY : "", MaidInfo : "", Upload : true 	},
		{ Id : 2, NextGuide : 3, Type : 3, IsDialog : 1, IsFinger : 1, Dialog : "再次打开轿子获取第二个宫女。", prefab : "", ButtonName : "", PersonXY : "0,429", FingerXY : "", MaidInfo : "", Upload : true 	},
		{ Id : 3, NextGuide : 4, Type : 4, IsDialog : 1, IsFinger : 0, Dialog : "当有两个一样宫女以后，可以用手把两个宫女拖到一起，合并升级宫女。", prefab : "", ButtonName : "", PersonXY : "0,429", FingerXY : "", MaidInfo : "1_2", Upload : true 	},
		{ Id : 4, NextGuide : 5, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "觉得合成宫女太累了？没关系，我们可以点击打开商店，购买宫女。", prefab : "Prefab/GameSceneView", ButtonName : "btn_shop", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", Upload : true 	},
		{ Id : 5, NextGuide : 6, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "点击购买宫女就可以直接获得一个宫女。", prefab : "Prefab/ShopView", ButtonName : "button_buy", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", Upload : false 	},
		{ Id : 6, NextGuide : 7, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "再次购买一个宫女吧。", prefab : "Prefab/ShopView", ButtonName : "button_buy", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", Upload : false 	},
		{ Id : 7, NextGuide : 8, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "让我们关闭商店看下。", prefab : "Prefab/ShopView", ButtonName : "button_shopclose", PersonXY : "0,159", FingerXY : "", MaidInfo : "", Upload : false 	},
		{ Id : 8, NextGuide : 9, Type : 4, IsDialog : 1, IsFinger : 0, Dialog : "我们把刚买的两个宫女合并升级。", prefab : "", ButtonName : "", PersonXY : "0,-466", FingerXY : "", MaidInfo : "1_2", Upload : true 	},
		{ Id : 9, NextGuide : 10, Type : 4, IsDialog : 1, IsFinger : 0, Dialog : "让我们接着合并升级宫女，可以开启新的关卡。", prefab : "", ButtonName : "", PersonXY : "0,-466", FingerXY : "", MaidInfo : "2_2", Upload : true 	},
		{ Id : 10, NextGuide : 11, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "刚才的宫女去哪里了？让我们点击按钮来切换地图找她。", prefab : "Prefab/GameSceneView", ButtonName : "cell_2", PersonXY : "0,159", FingerXY : "", MaidInfo : "", Upload : true 	},
		{ Id : 11, NextGuide : 12, Type : 2, IsDialog : 1, IsFinger : 1, Dialog : "原来在这里，合并高等级宫女不仅可以开启新关卡，还能解锁新功能。", prefab : "", ButtonName : "", PersonXY : "0,233", FingerXY : "217,-78", MaidInfo : "", Upload : true 	},
		{ Id : 12, NextGuide : 13, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了翻牌子功能，请点击打开看看。", prefab : "Prefab/GameSceneView", ButtonName : "btn_turnbrand", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", Upload : true 	},
		{ Id : 13, NextGuide : 14, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "尝试点击翻牌子，可以获取更多金币。（获得的金币数跟你拥有的宫女等级数量有关）", prefab : "Prefab/TurnBrandView", ButtonName : "BrandNodeParent4", PersonXY : "0,233", FingerXY : "", MaidInfo : "", Upload : false 	},
		{ Id : 14, NextGuide : 15, Type : 5, IsDialog : 0, IsFinger : 0, Dialog : "", prefab : "", ButtonName : "", PersonXY : "", FingerXY : "", MaidInfo : "", Upload : false 	},
		{ Id : 15, NextGuide : 16, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "运气真好！获得了很多钱，让我们返回去继续升级宫女吧。", prefab : "Prefab/TurnBrandView", ButtonName : "BackButton", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", Upload : false 	},
		{ Id : 16, NextGuide : 0, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "让我们回到第一关继续合并升级宫女吧！", prefab : "Prefab/GameSceneView", ButtonName : "cell_1", PersonXY : "0,233", FingerXY : "", MaidInfo : "", Upload : true 	}
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

