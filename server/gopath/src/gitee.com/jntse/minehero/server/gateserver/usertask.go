package main

import (
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/minehero/pbmsg"
	_"gitee.com/jntse/minehero/server/def"
	"gitee.com/jntse/minehero/server/tbl"
	"gitee.com/jntse/gotoolkit/util"
	pb "github.com/gogo/protobuf/proto"
	"strconv"
	"strings"
)

const (
	Task_Share		int32 = 1000
	Task_Win		int32 = 2000
	Task_Join		int32 = 3000
	Task_GetCoin	int32 = 4000
	Task_Kill		int32 = 5000
)

type UserTask struct {
	tasks map[int32]*msg.TaskData
	owner *GateUser
	curtask map[int32]int32
	tasktime int32
}

func (this *UserTask) Init(owner *GateUser) {
	this.owner = owner
	this.tasks = make(map[int32]*msg.TaskData)
	this.curtask = make(map[int32]int32)
}

func (this *UserTask) InitTask(){
	if !util.IsSameDay(int64(this.tasktime), util.CURTIME()){
		this.tasks = make(map[int32]*msg.TaskData)
		this.curtask = make(map[int32]int32)
		for _, value := range tbl.TaskBase.TTaskById{
			_, ok := this.curtask[value.MainTask]
			if ok {
				continue
			}
			initkey := value.MainTask + 1
			task := &msg.TaskData{Id: pb.Int32(initkey), Progress: pb.Int32(0), State: pb.Int32(0)}
			this.tasks[initkey] = task
			this.curtask[value.MainTask] = initkey
		}
		this.tasktime = int32(util.CURTIME())
	}
}

func (this *UserTask) Timer(){
	this.InitTask()
}

func (this *UserTask) LoadBin(bin *msg.Serialize) {
	taskbin := bin.GetBase().GetTask()
	if taskbin == nil {
		return
	}
	for _, data := range taskbin.GetTasks() {
		this.tasks[data.GetId()] = data
		this.curtask[data.GetId() / 1000 * 1000] = data.GetId()
	}
	this.tasktime = taskbin.GetTasktime()
}

func (this *UserTask) PackBin(bin *msg.Serialize) {
	bin.GetBase().Task = &msg.UserTask{Tasks: make([]*msg.TaskData, 0)}
	taskbin := bin.GetBase().GetTask()
	for _, data := range this.tasks {
		taskbin.Tasks = append(taskbin.Tasks, data)
	}
	taskbin.Tasktime = pb.Int32(this.tasktime)
}

func (this *UserTask) TaskFinish(id int32) {
	//task, find := this.tasks[id]
	//if find == false {
	//	task = &msg.TaskData{Id: pb.Int32(id), Progress: pb.Int32(0), Completed: pb.Int32(1)}
	//	this.tasks[id] = task
	//} else {
	//	if task.GetCompleted() == 1 {
	//		log.Info("玩家[%s %d] 重复完成任务[%d]", this.owner.Name(), this.owner.Id(), id)
	//		return
	//	}
	//	task.Completed = pb.Int32(1)
	//}

	//this.GiveTaskReward(id)
	//log.Info("玩家[%s %d] 完成任务[%d]", this.owner.Name(), this.owner.Id(), id)
}

func (this *UserTask) GetTaskProgress(id int32) int32 {
	task, find := this.tasks[id]
	if find == false {
		return 0
	}
	return task.GetProgress()
}

func (this *UserTask) SetTaskProgress(id, progress int32) {
	taskid, ok := this.curtask[id]
	if ok == false {
		taskid = id
	}
	task, find := this.tasks[taskid]
	if find == false {
		task = &msg.TaskData{Id: pb.Int32(id), Progress: pb.Int32(progress), State: pb.Int32(0)}
		this.tasks[id] = task
		return
	}
	task.Progress = pb.Int32(progress)
}

func (this *UserTask) AddTaskProgress(id, progress int32) {
	taskid, ok := this.curtask[id]
	if ok == false {
		log.Error("玩家[%s %d] 找不到当前任务[%d]", this.owner.Name(), this.owner.Id(), id)
		return
	}
	task, find := this.tasks[taskid]
	if find == false {
		log.Error("玩家[%s %d] 找不到任务列表[%d]", this.owner.Name(), this.owner.Id(), id)
		return
	}
	taskbase, configfind := tbl.TaskBase.TTaskById[taskid]
	if configfind == false {
		log.Error("玩家[%s %d] 找不到任务配置[%d]", this.owner.Name(), this.owner.Id(), id)
		return
	}
	if task.GetProgress() < taskbase.Count {
		task.Progress = pb.Int32(task.GetProgress() + progress)
		log.Info("玩家[%s %d] 任务[%d]更新[%d]", this.owner.Name(), this.owner.Id(), taskid, task.GetProgress())
		if task.GetProgress() >= taskbase.Count{
			task.Progress = pb.Int32(taskbase.Count)
			task.State = pb.Int32(1)
			log.Info("玩家[%s %d] 任务[%d]完成", this.owner.Name(), this.owner.Id(), taskid)
		}
	}
}

func (this *UserTask) SendTaskList() {
	send := &msg.GW2C_SendTaskList{Tasks: make([]*msg.TaskData, 0)}
	for _, task := range this.tasks {
		send.Tasks = append(send.Tasks, task)
	}
	this.owner.SendMsg(send)
}

func (this *UserTask) IsTaskFinish(id int32) bool {
	task, find := this.tasks[id]
	if find && task.GetState() == 1 {
		return true
	}
	return false
}

func (this *UserTask) GiveTaskReward(id int32) {
	if !this.IsTaskFinish(id) {
		log.Error("玩家[%s %d] 任务没有完成[%d]", this.owner.Name(), this.owner.Id(), id)
		return
	}

	taskbase, find := tbl.TaskBase.TTaskById[id]
	if find == false {
		log.Error("玩家[%s %d] 找不到任务配置[%d]", this.owner.Name(), this.owner.Id(), id)
		return
	}

	// 任务奖励
	rewardpair := strings.Split(taskbase.Reward, "-")
	if len(rewardpair) != 2 {
		log.Error("玩家[%s %d] 解析任务奖励失败[%d]", this.owner.Name(), this.owner.Id(), id)
		return
	}
	reward, _ := strconv.ParseInt(rewardpair[0], 10, 32)
	count, _ := strconv.ParseInt(rewardpair[1], 10, 32)

	this.owner.ClearReward()
	this.owner.AddItem(uint32(reward), uint32(count), "每日任务奖励", true)
	this.owner.NotifyReward()

	newtaskid := this.curtask[id/1000*1000]
	newtaskid++
	_, ok := tbl.TaskBase.TTaskById[newtaskid]
	if ok {
		task := &msg.TaskData{Id: pb.Int32(newtaskid), Progress: pb.Int32(0), State: pb.Int32(0)}
		this.tasks[newtaskid] = task
		this.curtask[id/1000*1000] = newtaskid
		delete(this.tasks, id)
	}else{
		this.tasks[id].State = pb.Int32(2)
	}

	this.SendTaskList()

	//
	//if id == int32(msg.TaskId_RegistAccount) || id == int32(msg.TaskId_RegisterTopScore) || id == int32(msg.TaskId_InviteeTopScore) {
	//	def.HttpWechatCompanyPay(this.owner.OpenId(), count, taskbase.Desc)
	//}
}

func (this *UserTask) FillCompleteTask (datas *[]*msg.TaskData) {
	for _, task := range this.tasks {
		if task.GetState() == 1{
			*datas = append(*datas, task)
		}
	}
}

