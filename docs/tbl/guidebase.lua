// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var Guide : table.IGuideDefine[] = [
		{ Id : 101, Resetid : 101, NextId : 102, Type : 3, IsDialog : 1, IsFinger : 1, Dialog : "欢迎来到后宫！我们先打开轿子获取一个宫女。", prefab : "", ViewName : "", ButtonName : "", PersonXY : "0,429", FingerXY : "", MaidInfo : "", ConditionType : 0, ConditionValue : 0 	},
		{ Id : 102, Resetid : 103, NextId : 103, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "您获得新形象！请点击关闭按钮关闭。", prefab : "Prefab/FindNewPlayerView", ViewName : "view", ButtonName : "button_close", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 103, Resetid : 103, NextId : 104, Type : 3, IsDialog : 1, IsFinger : 1, Dialog : "再次打开轿子获取第二个宫女。", prefab : "", ViewName : "", ButtonName : "", PersonXY : "0,429", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 104, Resetid : 104, NextId : 105, Type : 4, IsDialog : 1, IsFinger : 0, Dialog : "当有两个一样宫女以后，可以用手把两个宫女拖到一起，合并升级宫女。", prefab : "", ViewName : "", ButtonName : "", PersonXY : "0,429", FingerXY : "", MaidInfo : "1_2", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 105, Resetid : 106, NextId : 106, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜获得新形象！请点击关闭按钮关闭。", prefab : "Prefab/FindNewPlayerView", ViewName : "view", ButtonName : "button_close", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 106, Resetid : 106, NextId : 107, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "觉得合成宫女太累了？没关系，我们可以点击打开招募，招募宫女。", prefab : "Prefab/GameSceneView", ViewName : "btn_shop", ButtonName : "btn_shop", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 107, Resetid : 106, NextId : 108, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "点击招募宫女就可以直接获得一个宫女。", prefab : "Prefab/ShopView", ViewName : "button_buy", ButtonName : "button_buy", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 108, Resetid : 106, NextId : 109, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "再次招募一个宫女吧。", prefab : "Prefab/ShopView", ViewName : "button_buy", ButtonName : "button_buy", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 109, Resetid : 106, NextId : 110, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "让我们返回招募看下。", prefab : "Prefab/ShopView", ViewName : "button_dialogClose", ButtonName : "button_dialogClose", PersonXY : "0,159", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 110, Resetid : 110, NextId : 111, Type : 4, IsDialog : 1, IsFinger : 0, Dialog : "我们把刚买的两个宫女合并升级。", prefab : "", ViewName : "", ButtonName : "", PersonXY : "0,-466", FingerXY : "", MaidInfo : "1_2", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 111, Resetid : 111, NextId : 112, Type : 4, IsDialog : 1, IsFinger : 0, Dialog : "让我们接着合并升级宫女，可以开启新的关卡。", prefab : "", ViewName : "", ButtonName : "", PersonXY : "0,-466", FingerXY : "", MaidInfo : "2_2", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 112, Resetid : 113, NextId : 113, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜又获得高等级的新形象！请点击关闭按钮关闭。", prefab : "Prefab/FindNewPlayerView", ViewName : "view", ButtonName : "button_close", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 113, Resetid : 113, NextId : 114, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "刚才的宫女去哪里了？让我们点击按钮来切换地图找她。", prefab : "Prefab/GameSceneView", ViewName : "cell_2", ButtonName : "cell_2", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 114, Resetid : 114, NextId : 115, Type : 2, IsDialog : 1, IsFinger : 1, Dialog : "原来在这里，合并高等级宫女不仅可以开启新关卡，还能解锁新功能。", prefab : "", ViewName : "", ButtonName : "", PersonXY : "0,233", FingerXY : "189,196", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 115, Resetid : 115, NextId : 116, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了翻牌子功能，请点击打开看看。", prefab : "Prefab/GameSceneView", ViewName : "btn_turnbrand", ButtonName : "btn_turnbrand", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 116, Resetid : 115, NextId : 117, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "尝试点击翻牌子，可以获取更多金币。（获得的金币数跟你拥有的宫女等级数量有关）", prefab : "Prefab/TurnBrandView", ViewName : "BrandNodeParent4", ButtonName : "BrandNodeParent4", PersonXY : "0,233", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 117, Resetid : 115, NextId : 118, Type : 5, IsDialog : 0, IsFinger : 0, Dialog : "", prefab : "Prefab/TurnBrandView", ViewName : "BrandNodeParent4", ButtonName : "BrandNodeParent4", PersonXY : "", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 118, Resetid : 115, NextId : 119, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "运气真好！获得了很多钱，让我们返回去继续升级宫女吧。", prefab : "Prefab/TurnBrandView", ViewName : "BackButton", ButtonName : "BackButton", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 119, Resetid : 119, NextId : 0, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "让我们回到第一关继续合并升级宫女吧！", prefab : "Prefab/GameSceneView", ViewName : "cell_1", ButtonName : "cell_1", PersonXY : "0,233", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 201, Resetid : 201, NextId : 202, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了后宫功能，请点击打开看看。", prefab : "Prefab/GameSceneView", ViewName : "btn_palace", ButtonName : "btn_palace", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", ConditionType : 1, ConditionValue : 3 	},
		{ Id : 202, Resetid : 201, NextId : 203, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了一个后宫佳丽，快点击进去看看。", prefab : "Prefab/PalaceView", ViewName : "cell_1", ButtonName : "cell_1", PersonXY : "0,159", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 203, Resetid : 201, NextId : 204, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "首先购买一个侍女，侍女可以产钱跟御用品。", prefab : "Prefab/PalaceDetailView", ViewName : "PalaceMaidNode1", ButtonName : "PalaceMaidNode1", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 204, Resetid : 201, NextId : 205, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "点击购买按钮", prefab : "Prefab/PalaceMaidDetailView", ViewName : "button_buy", ButtonName : "button_buy", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 205, Resetid : 601, NextId : 206, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "侍女生产完成，点击收获。", prefab : "Prefab/PalaceDetailView", ViewName : "button_get", ButtonName : "button_get", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 206, Resetid : 301, NextId : 207, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "点击奖励界面关闭按钮。", prefab : "Prefab/PalaceTakeItemView", ViewName : "button_close", ButtonName : "button_close", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 207, Resetid : 301, NextId : 208, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜你解锁了赏赐功能，刚收货的御用品都存到了这里，快点开看看", prefab : "Prefab/PalaceDetailView", ViewName : "button_bestowed", ButtonName : "button_bestowed", PersonXY : "0,159", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 208, Resetid : 301, NextId : 209, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "快把刚才收获的御用品放入到赏赐栏里。", prefab : "Prefab/TravelView", ViewName : "SupplyItemNode_1", ButtonName : "SupplyItemNode_1", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 209, Resetid : 301, NextId : 210, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "放好了，点确定关闭界面。根据你放入的物品会触发宫里的很多随意事件。", prefab : "Prefab/TravelView", ViewName : "ConfirmButton", ButtonName : "ConfirmButton", PersonXY : "0,-233", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 210, Resetid : 401, NextId : 211, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜你触发了神秘事件!", prefab : "Prefab/EventDetailView", ViewName : "view", ButtonName : "CloseButton", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 211, Resetid : 401, NextId : 212, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "点击返回按钮。", prefab : "Prefab/PalaceDetailView", ViewName : "BackButton", ButtonName : "BackButton", PersonXY : "0,159", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 212, Resetid : 401, NextId : 213, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了回忆录！后宫的神秘事件，都会收帮你藏到这里。请点击打开看看。", prefab : "Prefab/PalaceView", ViewName : "button_handbook", ButtonName : "button_handbook", PersonXY : "0,-276", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 213, Resetid : 401, NextId : 214, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "这是刚才的事件。有什么感想可以留言呀。快点开看看。", prefab : "Prefab/EventView", ViewName : "EventItemNode__2", ButtonName : "EventItemNode__2", PersonXY : "0,-466", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 214, Resetid : 401, NextId : 0, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "想要留言可以点这里。", prefab : "Prefab/EventDetailView", ViewName : "button_common", ButtonName : "button_common", PersonXY : "0,0", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 301, Resetid : 301, NextId : 302, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了后宫功能，请点击打开看看。", prefab : "Prefab/GameSceneView", ViewName : "btn_palace", ButtonName : "btn_palace", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 302, Resetid : 301, NextId : 207, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了一个后宫佳丽，快点击进去看看。", prefab : "Prefab/PalaceView", ViewName : "cell_1", ButtonName : "cell_1", PersonXY : "0,159", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 401, Resetid : 401, NextId : 212, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了后宫功能，请点击打开看看。", prefab : "Prefab/GameSceneView", ViewName : "btn_palace", ButtonName : "btn_palace", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 601, Resetid : 601, NextId : 602, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了后宫功能，请点击打开看看。", prefab : "Prefab/GameSceneView", ViewName : "btn_palace", ButtonName : "btn_palace", PersonXY : "0,-241", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	},
		{ Id : 602, Resetid : 601, NextId : 205, Type : 1, IsDialog : 1, IsFinger : 1, Dialog : "恭喜解锁了一个后宫佳丽，快点击进去看看。", prefab : "Prefab/PalaceView", ViewName : "cell_1", ButtonName : "cell_1", PersonXY : "0,159", FingerXY : "", MaidInfo : "", ConditionType : 2, ConditionValue : 0 	}
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

