package main
import (
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/util"
	_"gitee.com/jntse/gotoolkit/eventqueue"
	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/minehero/server/def"
	"gitee.com/jntse/minehero/pbmsg"
	pb "github.com/golang/protobuf/proto"
	"encoding/json"
	"net/http"
	"strconv"
	"crypto/md5"
	"fmt"
	"time"
	"strings"
)

// --------------------------------------------------------------------------
/// @brief 侍女数据
// --------------------------------------------------------------------------
type MaidData struct {
	id				uint32
	count 			uint32
}
// --------------------------------------------------------------------------
/// @brief 玩家侍女
// --------------------------------------------------------------------------
type UserMaid struct {
	maids			map[uint32]* MaidData
}

// 添加侍女
func (this *UserMaid) AddMaid(id uint32, count uint32) *MaidData {
	maid, ok := this.maids[id];
	if !ok {
		maid = &MaidData{}
		maid.id = id
		maid.count = 0
		this.maids[id] = maid
	}
	maid.count = maid.count + count
	return maid
}

// 减少侍女
func (this *UserMaid) RemoveMaid(id uint32,count uint32) *MaidData {
	maid, ok := this.maids[id];
	if !ok {
		return nil
	}
	if maid.count < count {
		return nil
	}
	maid.count = maid.count - count
	return maid
}

// ========================= 消息接口 ========================= 
//购买侍女 
func (this *UserMaid) BuyMaid(user *GateUser,id uint32) (result uint32 ,addition *MaidData){

}

//合并侍女
func (this *UserMaid) MergeMaid(id uint32) (result uint32,removed *MaidData, addition *MaidData){
	maidconfg, find := tbl.TMaidLevelBase.TMaidLevelById[id]
	if !find {
		return 1,nil,nil
	}
	nextid = uint32(maidconfg.NextID)
	if nextid == 0 {
		return 2,nil,nil
	}
	maid, ok := this.maids[id]; 
	if !ok {
		return 3,nil,nil
	}
	if maid.count < 2 {
		return 4,nil,nil
	}
	//可以了 合并
	removed = this.RemoveMaid(id,2)
	if removed == nil {
		return 5,nil,nil
	}
	addition = this.AddMaid(nextid,1)
	return 0,removed,addition
}