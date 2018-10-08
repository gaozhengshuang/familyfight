/// [注：本文件为自动生成，不需要人为编辑，若有修改，请通过配置py脚本来重新生成.]
/// @author xiejian
/// @generate date: GENE_DATE

package tbl
import "gitee.com/jntse/minehero/server/tbl/excel"

type IBaseExcel interface {
	Load(filename string) error
	Reload() error
}

// --------------------------------------------------------------------------
/// @brief 为excel config 实例取一个别名
// --------------------------------------------------------------------------
var TGuide = table.InsTGuideTable
var MusicBase = table.InsMusicBaseTable
var LevelBasee = table.InsLevelBaseeTable
var TGoldRewardRatioBase = table.InsTGoldRewardRatioBaseTable
var TMaidLevelBase = table.InsTMaidLevelBaseTable
var Question = table.InsQuestionTable
var TMaidShopBase = table.InsTMaidShopBaseTable
var TbirckInfobase = table.InsTbirckInfobaseTable
var GiftProBase = table.InsGiftProBaseTable
var TTravelBase = table.InsTTravelBaseTable
var TBoxBase = table.InsTBoxBaseTable
var TPalaceMapMaidBase = table.InsTPalaceMapMaidBaseTable
var TEventBase = table.InsTEventBaseTable
var TPalaceMapBase = table.InsTPalaceMapBaseTable
var TBirckBase = table.InsTBirckBaseTable
var ProtoMsgIndex = table.InsProtoMsgIndexTable
var TDialogueBase = table.InsTDialogueBaseTable
var TBallGiftbase = table.InsTBallGiftbaseTable
var NoticeBase = table.InsNoticeBaseTable
var TPassLevelsBase = table.InsTPassLevelsBaseTable
var RechargeBase = table.InsRechargeBaseTable
var TBirckItembase = table.InsTBirckItembaseTable
var SignBase = table.InsSignBaseTable
var NameBase = table.InsNameBaseTable
var TPalaceMapMasterLevelsBase = table.InsTPalaceMapMasterLevelsBaseTable
var TBallBase = table.InsTBallBaseTable
var TTurnBrandBase = table.InsTTurnBrandBaseTable
var TaskBase = table.InsTaskBaseTable
var THeadBase = table.InsTHeadBaseTable
var ShopBase = table.InsShopBaseTable
var TbirckRefreshbase = table.InsTbirckRefreshbaseTable
var ItemBase = table.InsItemBaseTable

