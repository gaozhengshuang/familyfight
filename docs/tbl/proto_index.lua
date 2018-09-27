// Generated by github.com/davyxu/tabtoy
// Version: 2.8.10

module table {
export var ProtoId : table.IProtoIdDefine[] = [
		{ Id : 1, Name : "msg.AccountInfo" 	},
		{ Id : 2, Name : "msg.AccountGateInfo" 	},
		{ Id : 3, Name : "msg.C2GW_ReqTurnBrand" 	},
		{ Id : 4, Name : "msg.GW2C_RetTurnBrand" 	},
		{ Id : 5, Name : "msg.C2GW_ReqLinkup" 	},
		{ Id : 6, Name : "msg.GW2C_RetLinkup" 	},
		{ Id : 7, Name : "msg.BattleUser" 	},
		{ Id : 8, Name : "msg.GridItem" 	},
		{ Id : 9, Name : "msg.BT_UploadGameUser" 	},
		{ Id : 10, Name : "msg.BT_ReqEnterRoom" 	},
		{ Id : 11, Name : "msg.BT_GameInit" 	},
		{ Id : 12, Name : "msg.BT_SendBattleUser" 	},
		{ Id : 13, Name : "msg.BT_GameStart" 	},
		{ Id : 14, Name : "msg.BT_GameEnd" 	},
		{ Id : 15, Name : "msg.BT_GameOver" 	},
		{ Id : 16, Name : "msg.BT_ReqQuitGameRoom" 	},
		{ Id : 17, Name : "msg.BT_PickItem" 	},
		{ Id : 18, Name : "msg.BT_UpdateMoney" 	},
		{ Id : 19, Name : "msg.C2GW_ReqLogin" 	},
		{ Id : 20, Name : "msg.GW2C_RetLogin" 	},
		{ Id : 21, Name : "msg.GW2C_SendUserInfo" 	},
		{ Id : 22, Name : "msg.GW2C_SendUserPlatformMoney" 	},
		{ Id : 23, Name : "msg.C2GW_HeartBeat" 	},
		{ Id : 24, Name : "msg.GW2C_HeartBeat" 	},
		{ Id : 25, Name : "msg.C2GW_ReqStartGame" 	},
		{ Id : 26, Name : "msg.GW2C_RetStartGame" 	},
		{ Id : 27, Name : "msg.GW2C_Ret7DayReward" 	},
		{ Id : 28, Name : "msg.C2GW_Get7DayReward" 	},
		{ Id : 29, Name : "msg.C2GW_SendWechatAuthCode" 	},
		{ Id : 30, Name : "msg.C2L_ReqLogin" 	},
		{ Id : 31, Name : "msg.L2C_RetLogin" 	},
		{ Id : 32, Name : "msg.C2L_ReqRegistAccount" 	},
		{ Id : 33, Name : "msg.L2C_RetRegistAccount" 	},
		{ Id : 34, Name : "msg.GW2C_UpdateGold" 	},
		{ Id : 35, Name : "msg.GW2C_UpdateYuanbao" 	},
		{ Id : 36, Name : "msg.GW2C_UpdateCoupon" 	},
		{ Id : 37, Name : "msg.C2GW_UploadTrueGold" 	},
		{ Id : 38, Name : "msg.GW2C_UpdateTrueGold" 	},
		{ Id : 39, Name : "msg.C2GW_ReqPower" 	},
		{ Id : 40, Name : "msg.GW2C_UpdatePower" 	},
		{ Id : 41, Name : "msg.IpHost" 	},
		{ Id : 42, Name : "msg.PairNumItem" 	},
		{ Id : 43, Name : "msg.GW2L_ReqRegist" 	},
		{ Id : 44, Name : "msg.L2GW_RetRegist" 	},
		{ Id : 45, Name : "msg.GW2L_HeartBeat" 	},
		{ Id : 46, Name : "msg.L2GW_HeartBeat" 	},
		{ Id : 47, Name : "msg.L2GW_ReqRegistUser" 	},
		{ Id : 48, Name : "msg.GW2L_RegistUserRet" 	},
		{ Id : 49, Name : "msg.GW2MS_ReqRegist" 	},
		{ Id : 50, Name : "msg.MS2GW_RetRegist" 	},
		{ Id : 51, Name : "msg.GW2MS_HeartBeat" 	},
		{ Id : 52, Name : "msg.MS2GW_HeartBeat" 	},
		{ Id : 53, Name : "msg.GW2MS_ReqCreateRoom" 	},
		{ Id : 54, Name : "msg.MS2GW_RetCreateRoom" 	},
		{ Id : 55, Name : "msg.RS2GW_ReqRegist" 	},
		{ Id : 56, Name : "msg.GW2RS_RetRegist" 	},
		{ Id : 57, Name : "msg.GW2RS_UserDisconnect" 	},
		{ Id : 58, Name : "msg.RS2GW_RetUserDisconnect" 	},
		{ Id : 59, Name : "msg.GW2RS_MsgTransfer" 	},
		{ Id : 60, Name : "msg.RS2GW_MsgTransfer" 	},
		{ Id : 61, Name : "msg.C2GW_BuyItem" 	},
		{ Id : 62, Name : "msg.GW2C_AddPackageItem" 	},
		{ Id : 63, Name : "msg.GW2C_RemovePackageItem" 	},
		{ Id : 64, Name : "msg.GW2C_UpdateFreeStep" 	},
		{ Id : 65, Name : "msg.DeliveryGoods" 	},
		{ Id : 66, Name : "msg.C2GW_ReqDeliveryGoods" 	},
		{ Id : 67, Name : "msg.C2GW_ReqDeliveryDiamond" 	},
		{ Id : 68, Name : "msg.GW2C_RetDeliveryDiamond" 	},
		{ Id : 69, Name : "msg.BigRewardItem" 	},
		{ Id : 70, Name : "msg.Sync_BigRewardPickNum" 	},
		{ Id : 71, Name : "msg.C2GW_UseBagItem" 	},
		{ Id : 72, Name : "msg.C2GW_SellBagItem" 	},
		{ Id : 73, Name : "msg.GW2C_AckMaids" 	},
		{ Id : 74, Name : "msg.GW2C_AckMaidShop" 	},
		{ Id : 75, Name : "msg.C2GW_ReqBuyMaid" 	},
		{ Id : 76, Name : "msg.GW2C_AckBuyMaid" 	},
		{ Id : 77, Name : "msg.C2GW_ReqMergeMaid" 	},
		{ Id : 78, Name : "msg.GW2C_AckMergeMaid" 	},
		{ Id : 79, Name : "msg.GW2C_OfflineReward" 	},
		{ Id : 80, Name : "msg.RS2MS_ReqRegist" 	},
		{ Id : 81, Name : "msg.MS2RS_RetRegist" 	},
		{ Id : 82, Name : "msg.RS2MS_HeartBeat" 	},
		{ Id : 83, Name : "msg.MS2RS_HeartBeat" 	},
		{ Id : 84, Name : "msg.GateSimpleInfo" 	},
		{ Id : 85, Name : "msg.MS2RS_GateInfo" 	},
		{ Id : 86, Name : "msg.MS2RS_CreateRoom" 	},
		{ Id : 87, Name : "msg.RS2MS_RetCreateRoom" 	},
		{ Id : 88, Name : "msg.RS2MS_DeleteRoom" 	},
		{ Id : 89, Name : "msg.RS2MS_UpdateRewardPool" 	},
		{ Id : 90, Name : "msg.GW2C_MsgNotify" 	},
		{ Id : 91, Name : "msg.GW2C_MsgNotice" 	},
		{ Id : 92, Name : "msg.GW2MS_MsgNotice" 	},
		{ Id : 93, Name : "msg.RS2MS_MsgNotice" 	},
		{ Id : 94, Name : "msg.MS2GW_MsgNotice" 	},
		{ Id : 95, Name : "msg.GW2C_AckPalaceData" 	},
		{ Id : 96, Name : "msg.C2GW_ReqPalaceTakeBack" 	},
		{ Id : 97, Name : "msg.GW2C_RetPalaceTakeBack" 	},
		{ Id : 98, Name : "msg.C2GW_ReqMasterLevelup" 	},
		{ Id : 99, Name : "msg.GW2C_RetMasterLevelup" 	},
		{ Id : 100, Name : "msg.C2GW_ReqMaidUnlock" 	},
		{ Id : 101, Name : "msg.GW2C_RetMaidUnlock" 	},
		{ Id : 102, Name : "msg.EntityBase" 	},
		{ Id : 103, Name : "msg.SimpleCounter" 	},
		{ Id : 104, Name : "msg.UserWechat" 	},
		{ Id : 105, Name : "msg.UserTask" 	},
		{ Id : 106, Name : "msg.TaskData" 	},
		{ Id : 107, Name : "msg.LuckyDrawItem" 	},
		{ Id : 108, Name : "msg.LuckyDrawHistory" 	},
		{ Id : 109, Name : "msg.PowerData" 	},
		{ Id : 110, Name : "msg.UserBase" 	},
		{ Id : 111, Name : "msg.UserAddress" 	},
		{ Id : 112, Name : "msg.ItemData" 	},
		{ Id : 113, Name : "msg.ItemBin" 	},
		{ Id : 114, Name : "msg.MaidData" 	},
		{ Id : 115, Name : "msg.MaidShopData" 	},
		{ Id : 116, Name : "msg.MaidBin" 	},
		{ Id : 117, Name : "msg.PalaceData" 	},
		{ Id : 118, Name : "msg.TravelData" 	},
		{ Id : 119, Name : "msg.Serialize" 	},
		{ Id : 120, Name : "msg.MS2Server_BroadCast" 	},
		{ Id : 121, Name : "msg.GW2C_AckTravelData" 	},
		{ Id : 122, Name : "msg.GW2C_AckEventData" 	},
		{ Id : 123, Name : "msg.C2GW_ReqPrepareTravel" 	},
		{ Id : 124, Name : "msg.GW2C_AckPrepareTravel" 	},
		{ Id : 125, Name : "msg.C2GW_ReqCheckEvent" 	},
		{ Id : 126, Name : "msg.GW2C_AckCheckEvent" 	},
		{ Id : 127, Name : "msg.C2GW_ReqEventBarrage" 	},
		{ Id : 128, Name : "msg.GW2C_AckEventBarrage" 	},
		{ Id : 129, Name : "msg.C2GW_ReqSendEventBarrage" 	},
		{ Id : 130, Name : "msg.GW2C_AckSendEventBarrage" 	},
		{ Id : 131, Name : "msg.C2GW_AddDeliveryAddress" 	},
		{ Id : 132, Name : "msg.C2GW_DelDeliveryAddress" 	},
		{ Id : 133, Name : "msg.C2GW_ChangeDeliveryAddress" 	},
		{ Id : 134, Name : "msg.GW2C_SendDeliveryAddressList" 	},
		{ Id : 135, Name : "msg.C2GW_ReqRechargeMoney" 	},
		{ Id : 136, Name : "msg.GW2C_RetRechargeMoney" 	},
		{ Id : 137, Name : "msg.C2GW_PlatformRechargeDone" 	},
		{ Id : 138, Name : "msg.GW2C_SendWechatInfo" 	},
		{ Id : 139, Name : "msg.C2GW_StartLuckyDraw" 	},
		{ Id : 140, Name : "msg.GW2C_LuckyDrawHit" 	},
		{ Id : 141, Name : "msg.GW2C_FreePresentNotify" 	},
		{ Id : 142, Name : "msg.GW2C_SendTaskList" 	}
	]


// Id
export var ProtoIdById : game.Dictionary<table.IProtoIdDefine> = {}
function readProtoIdById(){
  for(let rec of ProtoId) {
    ProtoIdById[rec.Id] = rec; 
  }
}
readProtoIdById();

// Name
export var ProtoIdByName : game.Dictionary<table.IProtoIdDefine> = {}
function readProtoIdByName(){
  for(let rec of ProtoId) {
    ProtoIdByName[rec.Name] = rec; 
  }
}
readProtoIdByName();
}

