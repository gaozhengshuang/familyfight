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
var TPalaceMapMasterLevelsBase = table.InsTPalaceMapMasterLevelsBaseTable
var TFunctionOpen = table.InsTFunctionOpenTable
var TMaidShopBase = table.InsTMaidShopBaseTable
var GiftProBase = table.InsGiftProBaseTable
var TTravelBase = table.InsTTravelBaseTable
var TBoxBase = table.InsTBoxBaseTable
var TPalaceMapMaidBase = table.InsTPalaceMapMaidBaseTable
var TEventBase = table.InsTEventBaseTable
var TPalaceMapBase = table.InsTPalaceMapBaseTable
var TMaidLevelBase = table.InsTMaidLevelBaseTable
var ProtoMsgIndex = table.InsProtoMsgIndexTable
var TDialogueBase = table.InsTDialogueBaseTable
var TPalacePartBase = table.InsTPalacePartBaseTable
var TBallGiftbase = table.InsTBallGiftbaseTable
var TPassLevelsBase = table.InsTPassLevelsBaseTable
var TPalacePersonnel = table.InsTPalacePersonnelTable
var SignBase = table.InsSignBaseTable
var NameBase = table.InsNameBaseTable
var TTurnBrandBase = table.InsTTurnBrandBaseTable
var TaskBase = table.InsTaskBaseTable
var THeadBase = table.InsTHeadBaseTable
var ShopBase = table.InsShopBaseTable
var ItemBase = table.InsItemBaseTable

