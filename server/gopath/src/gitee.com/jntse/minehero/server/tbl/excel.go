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
var MusicBase = table.InsMusicBaseTable
var LevelBasee = table.InsLevelBaseeTable
var TMaidLevelBase = table.InsTMaidLevelBaseTable
var Question = table.InsQuestionTable
var TMaidShopBase = table.InsTMaidShopBaseTable
var TDialogue = table.InsTDialogueTable
var TbirckInfobase = table.InsTbirckInfobaseTable
var GiftProBase = table.InsGiftProBaseTable
var TBirckBase = table.InsTBirckBaseTable
var ProtoMsgIndex = table.InsProtoMsgIndexTable
var TBallGiftbase = table.InsTBallGiftbaseTable
var NoticeBase = table.InsNoticeBaseTable
var TPassLevelsBase = table.InsTPassLevelsBaseTable
var RechargeBase = table.InsRechargeBaseTable
var TBirckItembase = table.InsTBirckItembaseTable
var SignBase = table.InsSignBaseTable
var NameBase = table.InsNameBaseTable
var TBallBase = table.InsTBallBaseTable
var TaskBase = table.InsTaskBaseTable
var ShopBase = table.InsShopBaseTable
var TbirckRefreshbase = table.InsTbirckRefreshbaseTable
var ItemBase = table.InsItemBaseTable

