package main
import (
	_"fmt"
	_"gitee.com/jntse/minehero/server/tbl"
	_"gitee.com/jntse/minehero/pbmsg"
	_"gitee.com/jntse/gotoolkit/util"
)

//func (this *GameRoom) UpdateMoneyByClient(money uint64) {
//	if this.owner == nil {
//		return
//	}
//
//	// 设置
//	this.owner.SetGold(uint32(money), "同步客户端", true)
//
//	// 检查任务
//	taskid := int32(msg.TaskId_RegisterTopScore)
//	task, find := tbl.TaskBase.TTaskById[uint32(taskid)]
//	if this.owner.task.IsTaskFinish(taskid) == false && find && money >= uint64(task.Count) {
//		this.owner.task.TaskFinish(taskid) 
//		inviter := this.owner.Inviter()
//		if inviter != 0 { Redis().SAdd(fmt.Sprintf("task_invitee_topscorefinish_%d", inviter), this.owner.Id()) }
//	}
//
//}

