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
		{ Id : 7, Name : "msg.GW2C_AckBoxData" 	},
		{ Id : 8, Name : "msg.C2GW_ReqOpenBox" 	},
		{ Id : 9, Name : "msg.GW2C_RetOpenBox" 	},
		{ Id : 10, Name : "msg.C2GW_ReqTenSecond" 	},
		{ Id : 11, Name : "msg.GW2C_AckTenSecond" 	},
		{ Id : 12, Name : "msg.C2GW_ReqKickAss" 	},
		{ Id : 13, Name : "msg.GW2C_AckKickAss" 	},
		{ Id : 14, Name : "msg.RobotPalaceData" 	},
		{ Id : 15, Name : "msg.C2GW_ReqAttackPalaceData" 	},
		{ Id : 16, Name : "msg.GW2C_AckAttackPalaceData" 	},
		{ Id : 17, Name : "msg.C2GW_ReqAttackPalace" 	},
		{ Id : 18, Name : "msg.GW2C_AckAttackPalace" 	},
		{ Id : 19, Name : "msg.GW2C_PushActiveRecord" 	},
		{ Id : 20, Name : "msg.C2GW_ReqGuessKingData" 	},
		{ Id : 21, Name : "msg.GW2C_AckGuessKingData" 	},
		{ Id : 22, Name : "msg.C2GW_ReqGuessKing" 	},
		{ Id : 23, Name : "msg.GW2C_AckGuessKing" 	},
		{ Id : 24, Name : "msg.C2GW_ReqLuckily" 	},
		{ Id : 25, Name : "msg.GW2C_AckLuckily" 	},
		{ Id : 26, Name : "msg.C2GW_ReqTryst" 	},
		{ Id : 27, Name : "msg.GW2C_AckTryst" 	},
		{ Id : 28, Name : "msg.GW2C_PushActiveData" 	},
		{ Id : 29, Name : "msg.C2GW_ReqSignin" 	},
		{ Id : 30, Name : "msg.GW2C_AckSignin" 	},
		{ Id : 31, Name : "msg.C2GW_ReqDailyPower" 	},
		{ Id : 32, Name : "msg.GW2C_AckDailyPower" 	},
		{ Id : 33, Name : "msg.BattleUser" 	},
		{ Id : 34, Name : "msg.GridItem" 	},
		{ Id : 35, Name : "msg.BT_UploadGameUser" 	},
		{ Id : 36, Name : "msg.BT_ReqEnterRoom" 	},
		{ Id : 37, Name : "msg.BT_GameInit" 	},
		{ Id : 38, Name : "msg.BT_SendBattleUser" 	},
		{ Id : 39, Name : "msg.BT_GameStart" 	},
		{ Id : 40, Name : "msg.BT_GameEnd" 	},
		{ Id : 41, Name : "msg.BT_GameOver" 	},
		{ Id : 42, Name : "msg.BT_ReqQuitGameRoom" 	},
		{ Id : 43, Name : "msg.BT_PickItem" 	},
		{ Id : 44, Name : "msg.BT_UpdateMoney" 	},
		{ Id : 45, Name : "msg.C2GW_ReqLogin" 	},
		{ Id : 46, Name : "msg.GW2C_RetLogin" 	},
		{ Id : 47, Name : "msg.GW2C_SendUserInfo" 	},
		{ Id : 48, Name : "msg.GW2C_SendUserPlatformMoney" 	},
		{ Id : 49, Name : "msg.C2GW_HeartBeat" 	},
		{ Id : 50, Name : "msg.GW2C_HeartBeat" 	},
		{ Id : 51, Name : "msg.C2GW_ReqStartGame" 	},
		{ Id : 52, Name : "msg.GW2C_RetStartGame" 	},
		{ Id : 53, Name : "msg.GW2C_Ret7DayReward" 	},
		{ Id : 54, Name : "msg.C2GW_Get7DayReward" 	},
		{ Id : 55, Name : "msg.C2GW_SendWechatAuthCode" 	},
		{ Id : 56, Name : "msg.C2L_ReqLogin" 	},
		{ Id : 57, Name : "msg.C2L_ReqLoginWechat" 	},
		{ Id : 58, Name : "msg.L2C_RetLogin" 	},
		{ Id : 59, Name : "msg.C2L_ReqRegistAccount" 	},
		{ Id : 60, Name : "msg.L2C_RetRegistAccount" 	},
		{ Id : 61, Name : "msg.GW2C_UpdateGold" 	},
		{ Id : 62, Name : "msg.GW2C_UpdateYuanbao" 	},
		{ Id : 63, Name : "msg.GW2C_UpdateCoupon" 	},
		{ Id : 64, Name : "msg.C2GW_UploadTrueGold" 	},
		{ Id : 65, Name : "msg.GW2C_UpdateTrueGold" 	},
		{ Id : 66, Name : "msg.C2GW_UploadBigGold" 	},
		{ Id : 67, Name : "msg.GW2C_UpdateBigGold" 	},
		{ Id : 68, Name : "msg.C2GW_ReqPower" 	},
		{ Id : 69, Name : "msg.GW2C_UpdatePower" 	},
		{ Id : 70, Name : "msg.C2GW_ReqMiniGameCoin" 	},
		{ Id : 71, Name : "msg.GW2C_UpdateMiniGameCoin" 	},
		{ Id : 72, Name : "msg.IpHost" 	},
		{ Id : 73, Name : "msg.PairNumItem" 	},
		{ Id : 74, Name : "msg.GW2L_ReqRegist" 	},
		{ Id : 75, Name : "msg.L2GW_RetRegist" 	},
		{ Id : 76, Name : "msg.GW2L_HeartBeat" 	},
		{ Id : 77, Name : "msg.L2GW_HeartBeat" 	},
		{ Id : 78, Name : "msg.L2GW_ReqRegistUser" 	},
		{ Id : 79, Name : "msg.GW2L_RegistUserRet" 	},
		{ Id : 80, Name : "msg.GW2MS_ReqRegist" 	},
		{ Id : 81, Name : "msg.MS2GW_RetRegist" 	},
		{ Id : 82, Name : "msg.GW2MS_HeartBeat" 	},
		{ Id : 83, Name : "msg.MS2GW_HeartBeat" 	},
		{ Id : 84, Name : "msg.GW2MS_ReqCreateRoom" 	},
		{ Id : 85, Name : "msg.MS2GW_RetCreateRoom" 	},
		{ Id : 86, Name : "msg.RS2GW_ReqRegist" 	},
		{ Id : 87, Name : "msg.GW2RS_RetRegist" 	},
		{ Id : 88, Name : "msg.GW2RS_UserDisconnect" 	},
		{ Id : 89, Name : "msg.RS2GW_RetUserDisconnect" 	},
		{ Id : 90, Name : "msg.GW2RS_MsgTransfer" 	},
		{ Id : 91, Name : "msg.RS2GW_MsgTransfer" 	},
		{ Id : 92, Name : "msg.GW2C_PushGuideData" 	},
		{ Id : 93, Name : "msg.C2GW_UpdateGuideData" 	},
		{ Id : 94, Name : "msg.GW2C_AckGuideData" 	},
		{ Id : 95, Name : "msg.C2GW_NotifyOpenLevel" 	},
		{ Id : 96, Name : "msg.C2GW_BuyItem" 	},
		{ Id : 97, Name : "msg.GW2C_AddPackageItem" 	},
		{ Id : 98, Name : "msg.GW2C_RemovePackageItem" 	},
		{ Id : 99, Name : "msg.GW2C_UpdateFreeStep" 	},
		{ Id : 100, Name : "msg.DeliveryGoods" 	},
		{ Id : 101, Name : "msg.C2GW_ReqDeliveryGoods" 	},
		{ Id : 102, Name : "msg.C2GW_ReqDeliveryDiamond" 	},
		{ Id : 103, Name : "msg.GW2C_RetDeliveryDiamond" 	},
		{ Id : 104, Name : "msg.BigRewardItem" 	},
		{ Id : 105, Name : "msg.Sync_BigRewardPickNum" 	},
		{ Id : 106, Name : "msg.C2GW_UseBagItem" 	},
		{ Id : 107, Name : "msg.C2GW_SellBagItem" 	},
		{ Id : 108, Name : "msg.GW2C_AckMaids" 	},
		{ Id : 109, Name : "msg.GW2C_AckMaidShop" 	},
		{ Id : 110, Name : "msg.C2GW_ReqBuyMaid" 	},
		{ Id : 111, Name : "msg.GW2C_AckBuyMaid" 	},
		{ Id : 112, Name : "msg.C2GW_ReqMergeMaid" 	},
		{ Id : 113, Name : "msg.GW2C_AckMergeMaid" 	},
		{ Id : 114, Name : "msg.GW2C_OfflineReward" 	},
		{ Id : 115, Name : "msg.RS2MS_ReqRegist" 	},
		{ Id : 116, Name : "msg.MS2RS_RetRegist" 	},
		{ Id : 117, Name : "msg.RS2MS_HeartBeat" 	},
		{ Id : 118, Name : "msg.MS2RS_HeartBeat" 	},
		{ Id : 119, Name : "msg.GateSimpleInfo" 	},
		{ Id : 120, Name : "msg.MS2RS_GateInfo" 	},
		{ Id : 121, Name : "msg.MS2RS_CreateRoom" 	},
		{ Id : 122, Name : "msg.RS2MS_RetCreateRoom" 	},
		{ Id : 123, Name : "msg.RS2MS_DeleteRoom" 	},
		{ Id : 124, Name : "msg.RS2MS_UpdateRewardPool" 	},
		{ Id : 125, Name : "msg.GW2C_MsgNotify" 	},
		{ Id : 126, Name : "msg.GW2C_MsgNotice" 	},
		{ Id : 127, Name : "msg.GW2MS_MsgNotice" 	},
		{ Id : 128, Name : "msg.RS2MS_MsgNotice" 	},
		{ Id : 129, Name : "msg.MS2GW_MsgNotice" 	},
		{ Id : 130, Name : "msg.GW2C_RewardNotify" 	},
		{ Id : 131, Name : "msg.GW2C_AckPalaceData" 	},
		{ Id : 132, Name : "msg.C2GW_ReqPalaceTakeBack" 	},
		{ Id : 133, Name : "msg.GW2C_RetPalaceTakeBack" 	},
		{ Id : 134, Name : "msg.C2GW_ReqMasterLevelup" 	},
		{ Id : 135, Name : "msg.GW2C_RetMasterLevelup" 	},
		{ Id : 136, Name : "msg.C2GW_ReqMaidUnlock" 	},
		{ Id : 137, Name : "msg.GW2C_RetMaidUnlock" 	},
		{ Id : 138, Name : "msg.C2GW_ReqPartLevelup" 	},
		{ Id : 139, Name : "msg.GW2C_AckPartLevelup" 	},
		{ Id : 140, Name : "msg.EntityBase" 	},
		{ Id : 141, Name : "msg.SimpleCounter" 	},
		{ Id : 142, Name : "msg.UserWechat" 	},
		{ Id : 143, Name : "msg.UserTask" 	},
		{ Id : 144, Name : "msg.TaskData" 	},
		{ Id : 145, Name : "msg.LuckyDrawItem" 	},
		{ Id : 146, Name : "msg.LuckyDrawHistory" 	},
		{ Id : 147, Name : "msg.PowerData" 	},
		{ Id : 148, Name : "msg.UserBase" 	},
		{ Id : 149, Name : "msg.UserAddress" 	},
		{ Id : 150, Name : "msg.ItemData" 	},
		{ Id : 151, Name : "msg.ItemBin" 	},
		{ Id : 152, Name : "msg.MaidData" 	},
		{ Id : 153, Name : "msg.MaidShopData" 	},
		{ Id : 154, Name : "msg.MaidBin" 	},
		{ Id : 155, Name : "msg.PalaceData" 	},
		{ Id : 156, Name : "msg.TravelData" 	},
		{ Id : 157, Name : "msg.BoxData" 	},
		{ Id : 158, Name : "msg.GuideData" 	},
		{ Id : 159, Name : "msg.ActiveData" 	},
		{ Id : 160, Name : "msg.Serialize" 	},
		{ Id : 161, Name : "msg.RewardData" 	},
		{ Id : 162, Name : "msg.RewardsData" 	},
		{ Id : 163, Name : "msg.MS2Server_BroadCast" 	},
		{ Id : 164, Name : "msg.ShareData" 	},
		{ Id : 165, Name : "msg.C2GW_ReqShareMessage" 	},
		{ Id : 166, Name : "msg.GW2C_AckShareMessage" 	},
		{ Id : 167, Name : "msg.GW2C_AckTravelData" 	},
		{ Id : 168, Name : "msg.GW2C_AckEventData" 	},
		{ Id : 169, Name : "msg.C2GW_ReqPrepareTravel" 	},
		{ Id : 170, Name : "msg.GW2C_AckPrepareTravel" 	},
		{ Id : 171, Name : "msg.C2GW_ReqCheckEvent" 	},
		{ Id : 172, Name : "msg.GW2C_AckCheckEvent" 	},
		{ Id : 173, Name : "msg.C2GW_ReqEventBarrage" 	},
		{ Id : 174, Name : "msg.GW2C_AckEventBarrage" 	},
		{ Id : 175, Name : "msg.C2GW_ReqSendEventBarrage" 	},
		{ Id : 176, Name : "msg.GW2C_AckSendEventBarrage" 	},
		{ Id : 177, Name : "msg.C2GW_ReqTravelView" 	},
		{ Id : 178, Name : "msg.GW2C_AckTravelView" 	},
		{ Id : 179, Name : "msg.C2GW_AddDeliveryAddress" 	},
		{ Id : 180, Name : "msg.C2GW_DelDeliveryAddress" 	},
		{ Id : 181, Name : "msg.C2GW_ChangeDeliveryAddress" 	},
		{ Id : 182, Name : "msg.GW2C_SendDeliveryAddressList" 	},
		{ Id : 183, Name : "msg.C2GW_ReqRechargeMoney" 	},
		{ Id : 184, Name : "msg.GW2C_RetRechargeMoney" 	},
		{ Id : 185, Name : "msg.C2GW_PlatformRechargeDone" 	},
		{ Id : 186, Name : "msg.GW2C_SendWechatInfo" 	},
		{ Id : 187, Name : "msg.C2GW_StartLuckyDraw" 	},
		{ Id : 188, Name : "msg.GW2C_LuckyDrawHit" 	},
		{ Id : 189, Name : "msg.GW2C_FreePresentNotify" 	},
		{ Id : 190, Name : "msg.GW2C_SendTaskList" 	}
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

