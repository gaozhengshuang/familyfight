package main
import (
    _"fmt"
    _"gitee.com/jntse/gotoolkit/net"
    "gitee.com/jntse/gotoolkit/log"
    "gitee.com/jntse/minehero/pbmsg"
    pb "github.com/gogo/protobuf/proto"
    "gitee.com/jntse/gotoolkit/util"
    "gitee.com/jntse/minehero/server/tbl"
)

// --------------------------------------------------------------------------
/// @brief RoomServer
// --------------------------------------------------------------------------
type GameRoomAgent struct {
    uid                 int64                               //房间id
    members             map[int64]*msg.RoomMemberInfo       //成员信息列表
    sumreward           int32                               //总奖池
    questions           []int32                             //题目数组
    round               int32                               //轮数
    starttime           int32                               //开始时间
    endgameflag         bool                                //结束标示
    updateflag          bool                                //更新标示
    curquestion         int32                               //当前题目
    curanswer           int32                               //当前答案
    answerstatus        int32								//答题状态
    answertime          int32
    lasttick            int32                               //上次tick时间
    robottick           map[int64]int32            
    waittime            int32
    gametype            int32
    robotmap            map[int32]int32
    cost                int32 
    robotnum            int32
	roomstate			int32								//房间状态
}

func NewGameRoomAgent(id int64, gtype int32) *GameRoomAgent {
	gate := &GameRoomAgent{}
    gate.uid = id
    gate.members = make(map[int64]*msg.RoomMemberInfo)
    gate.sumreward = 0
    gate.questions = make([]int32, 0)
    gate.round = 0
    gate.starttime = int32(util.CURTIME()) + int32(tbl.Global.Gamewaittime)
    gate.endgameflag = false
    gate.updateflag = false
    gate.curquestion = 0
    gate.curanswer = 0
    gate.answerstatus = 0
    gate.answertime = 0
    gate.waittime = 2
	gate.roomstate = 0
    gate.gametype = gtype
    gate.robottick = make(map[int64]int32)
    gate.robotmap = make(map[int32]int32)
    gate.cost = int32(tbl.Global.Gametype[gtype])
    gate.InitQuestion()
    gate.InitRobot()
	return gate
}

func (this *GameRoomAgent) InitRobot() {
    this.robotnum = util.RandBetween(int32(tbl.Global.Gamerobotmin),int32(tbl.Global.Gamerobotnum))
	//this.robotnum = int32(tbl.Global.Gamerobotnum)
    for i := 1; i <= int(this.robotnum); i++ {
        this.robotmap[int32(i)] = int32(util.CURTIME()) + util.RandBetween(1,8)
    }
    this.updateflag = false
}

func (this *GameRoomAgent) InitQuestion(){
    tmpmap := make(map[int32]int32)
    for {
        index := util.RandBetween(1, int32(len(tbl.Question.TquestionById)))
        _, ok := tmpmap[index]
        if ok {
            continue
        }else {
            tmpmap[index] = index
            this.questions = append(this.questions, index)
        }
        if len(this.questions) >= int(tbl.Global.Gameroundcount) {
            break
        }        
    }
}

func (this *GameRoomAgent) Id() int64{
    return this.uid
}

func (this *GameRoomAgent) AddMember(member *msg.RoomMemberInfo, cost int32) bool{
    _, ok := this.members[member.GetUid()]
    if !ok {
        this.members[member.GetUid()] = member
        cost = cost * (100 - int32(tbl.Global.Gamerewardper)) / 100        
        this.sumreward += cost
        this.updateflag = true
        this.UpdateOne(member.GetUid())

        send := &msg.GW2C_JoinOk{}
        send.Starttime = pb.Int32(this.starttime)
        this.SendMsgById(send, member.GetUid())

        log.Info("房间[%d] 玩家[%d]进入房间, 总奖池[%d]", this.Id(), member.GetUid(), this.sumreward)
        return true
    }
    return false
}

func (this *GameRoomAgent) DelMember(uid int64) bool{
    _, ok := this.members[uid]
    if ok {
        delete(this.members, uid)
        //this.updateflag = true
        user := UserMgr().FindById(uint64(uid))
        if user != nil {
            user.roomid = 0
            send := &msg.GW2C_GameOver{Reward : pb.Int32(0)}
            this.SendMsgById(send, uid)            
        }
        if  this.starttime >= int32(util.CURTIME()) {
            this.sumreward -= this.cost
        }
        log.Info("房间[%d] 玩家[%d]失败离开房间", this.Id(), uid)
        return true
    }
    return false
}

func (this *GameRoomAgent) AnswerQuestion(uid int64, answer int32){
    member, ok := this.members[uid]
    if !ok {
        return
    }
    member.Answer = pb.Int32(answer)
    this.updateflag = true

    send := &msg.GW2C_AnswerOk{}
    send.Answer = pb.Int32(answer)
    this.SendMsgById(send, uid)
    //this.UpdateOne(member.GetUid())
}

func (this *GameRoomAgent) UpdateAll(){
    if this.updateflag {
        send := &msg.GW2C_UpdateRoomInfo{}
        send.Sumreward = pb.Int32(this.sumreward)
        for _, v := range this.members {
            send.Members = append(send.Members, v)
        }
        this.SendToAllMsg(send)
    }
    this.updateflag = false
}

func (this *GameRoomAgent) UpdateOne(uid int64){
    send := &msg.GW2C_UpdateRoomInfo{}
    send.Sumreward = pb.Int32(this.sumreward)
    for _, v := range this.members {
        send.Members = append(send.Members, v)
    }
    this.SendMsgById(send, uid)        
}

func (this *GameRoomAgent) SendToAllMsg(msg pb.Message) {
    for _, v := range this.members {
        if v.GetUid() < 100 {
            continue
        }
        user := UserMgr().FindById(uint64(v.GetUid()))
        if user != nil {
            user.SendMsg(msg)
        }
    }
}

func (this *GameRoomAgent) SendMsgById(msg pb.Message, uid int64) {
    if uid < 100 {
        return
    }
    user := UserMgr().FindById(uint64(uid))
    if user != nil {     
        user.SendMsg(msg)
    }
}

func (this *GameRoomAgent) Tick() bool{
	if this.lasttick == int32(util.CURTIME()){
		return true
	}
	this.lasttick = int32(util.CURTIME())
	this.UpdateAll()
	switch (this.roomstate) {
	case 0:
		for k, v := range this.robotmap {
			if int32(util.CURTIME()) == v {
				member := &msg.RoomMemberInfo{Uid : pb.Int64(int64(k)), Name : pb.String(GateSvr().GetRandNickName()), Answer : pb.Int32(util.RandBetween(1,2))}
				this.AddMember(member, int32(this.cost))
			}
		}
		if len(this.members) >= int(tbl.Global.Gamemaxmember) || this.starttime < int32(util.CURTIME()) {
			this.roomstate = 1
		}
	case 1:
		this.DoingGame()
		if this.endgameflag {
			this.roomstate = 2
		}
	case 2:
		this.GiveReward()
		return false

	}
	return true
}

func (this *GameRoomAgent) IsStart() bool {
	if this.roomstate != 0 {
		return true
	}
    return false
}

func (this *GameRoomAgent) DoingGame(){
    switch (this.answerstatus){
        case 0:
            this.SendStart()
            this.ChangeStatus(1)
        case 1:
            if this.waittime > 0 {
                this.waittime--
            }
            if this.waittime == 0 {
                this.waittime = 2
                this.ChangeStatus(2)
            }
        case 2:
            this.SendQuestion(this.round)
            this.answertime = int32(tbl.Global.Gameroundtime)
            this.ChangeStatus(3)
        case 3:
            if this.answertime > 0 {
                for k, v := range this.robottick {
                    if this.answertime == v {
                        //this.AnswerQuestion(k, this.curanswer)
                        this.AnswerQuestion(k, util.RandBetween(1,2))
                    }
                }
                this.answertime--
                if this.answertime == 0 {
                    this.CalcAnswer()
                    this.ChangeStatus(4)
                }
            }
        case 4:
            this.round++
            if this.round >= int32(tbl.Global.Gameroundcount) {
                this.endgameflag = true
            }else{
                this.ChangeStatus(1)
            }
    }
}

func (this *GameRoomAgent) SendStart() {
    send := &msg.GW2C_StartGame{}
    this.SendToAllMsg(send)
}

func (this *GameRoomAgent) SendQuestion(round int32){
    if int(round) > len(this.questions){
        return
    }
    qconfig , findid := tbl.Question.TquestionById[this.questions[round]]
    if findid == false{
        return
    }
    this.curanswer = qconfig.Answer
    send := &msg.GW2C_QuestionInfo{
        Txt : pb.String(qconfig.Question), 
        Round : pb.Int32(round+1), 
        Time : pb.Int32(int32(util.CURTIME())+int32(tbl.Global.Gameroundtime)),
        Left : pb.Int32(int32(tbl.Global.Gameroundcount)-round),
    }
    this.SendToAllMsg(send)
    log.Info("房间[%d] 当前轮数[%d] 发送题目[%d][%s], 答案:%d", this.Id(), round+1, qconfig.Id, qconfig.Question, qconfig.Answer)
    for i := 1; i <= int(this.robotnum); i++ {
        this.AnswerQuestion(int64(i), util.RandBetween(1,2))
        this.robottick[int64(i)] = util.RandBetween(3,7)
    }

}

func (this *GameRoomAgent) ChangeStatus(status int32){
    this.answerstatus = status
}

func (this *GameRoomAgent) CalcAnswer(){
    delids := make([]int64, 0)
    for k, v := range this.members{
        if v.GetAnswer() != this.curanswer{
            delids = append(delids, k)
        }
    }
    send := &msg.GW2C_AnswerInfo{}
    send.Answer = pb.Int32(this.curanswer)
    for _, v := range delids {
        send.Delids = append(send.Delids, v)
    }
    this.SendToAllMsg(send)
	delnum := len(delids)
    for _, v := range delids {
        this.DelMember(v)
    }
	for k, _ := range this.members {
		user := UserMgr().FindById(uint64(k))
		if user != nil {
			user.task.AddTaskProgress(Task_Kill, int32(delnum))
		}
	}
}

func (this *GameRoomAgent) GiveReward(){
    if len(this.members) == 0{
        return
    }
    reward := this.sumreward / int32(len(this.members))
    for k, _ := range this.members{
        if k <= 100{
            continue
        }
        user := UserMgr().FindById(uint64(k))
		send := &msg.GW2C_GameOver{Reward : pb.Int32(reward)}
        if user != nil {
            user.roomid = 0
			user.task.AddTaskProgress(Task_Win, 1)
			user.AddYuanbao(uint32(reward), "比赛获胜", true)
			if reward > this.cost {
				user.task.AddTaskProgress(Task_GetCoin, reward - this.cost)
				user.UpdateSortScore(0, reward - this.cost)
			}
			user.task.FillCompleteTask(&send.Tasks)
        }
        this.SendMsgById(send, k)
        log.Info("房间[%d] 发放金币奖励[%d]给玩家[%d], ", this.Id(), reward, k)
    }
}


// --------------------------------------------------------------------------
/// @brief 
// --------------------------------------------------------------------------
type GameRoomSvrManager struct {
	rooms           map[int64]*GameRoomAgent		// 房间服务器
    roomid          int64                   // 房间id
    curidmap        map[int32]int64          
}

func (this *GameRoomSvrManager) Init() {
	this.rooms = make(map[int64]*GameRoomAgent)
    this.roomid = 1
    this.curidmap = make(map[int32]int64)
    for k, _ := range tbl.Global.Gametype {
        this.curidmap[int32(k+1)] = 1;
    }
}

func (this *GameRoomSvrManager) Num() int {
	return len(this.rooms)
}

func (this *GameRoomSvrManager) AddRoom(agent *GameRoomAgent) {
	id := agent.Id()
	this.rooms[id] = agent
}

func (this *GameRoomSvrManager) DelRoom(id int64) {
	delete(this.rooms, id)
}

func (this *GameRoomSvrManager) FindRoom(id int64) *GameRoomAgent {
	agent, _ := this.rooms[id]
	return agent
}

func (this *GameRoomSvrManager) Tick(now int64) {
    delids := make([]int64, 0) 
	for k, v := range this.rooms {
		if v.Tick() == false {
            delids = append(delids, k)
        }
	}
    for _, v := range delids {
        delete(this.rooms, v)
    }
}

func (this *GameRoomSvrManager) OnClose(uid int64) {
	agent := this.FindRoom(uid)
	if agent == nil {return }
	this.DelRoom(uid)
	log.Info("房间服离线 id=%d 当前总数:%d", uid, this.Num())
}

func (this *GameRoomSvrManager) AddNew(id int64, gtype int32) *GameRoomAgent{
	agent := NewGameRoomAgent(id, gtype)
	this.AddRoom(agent)
	log.Info("注册房间 id=%d 当前总数:%d", agent.Id(), GameRoomSvrMgr().Num())
    return agent
}

func (this *GameRoomSvrManager) GetNotFullRoom(gtype int32) *GameRoomAgent{
    gtype = gtype + 1
    curid := int64(gtype) * 1000000000 + this.curidmap[gtype]    
    room := this.FindRoom(curid)
    if room == nil {
        return this.AddNew(curid, gtype-1)       
    } else {
        if room.IsStart() {
            this.curidmap[gtype]++
            return this.AddNew(curid+1, gtype-1)
        } else {
            return room
        }
    }
}

func (this *GameRoomSvrManager) JoinGame(user *GateUser, gtype int32) {
    if user.roomid != 0 {
        return
    }

    if int(gtype) > len(tbl.Global.Gametype){
        return
    }

    if user.GetYuanbao() < uint32(tbl.Global.Gametype[gtype]) {
        return
    }

    user.RemoveYuanbao(uint32(tbl.Global.Gametype[gtype]), "参加游戏", true)
    this.JoinGameOk(user, gtype)

    //event := NewRemovePlatformCoinsEvent(int32(tbl.Global.Gametype[gtype]), 0, "红包答题扣除金币", user.RemovePlatformCoins, user.RemoveCoinsOk)
    //user.AsynEventInsert(event)

    //user.gameflag = true
}

func (this *GameRoomSvrManager) JoinGameOk(user *GateUser, gtype int32) {
    room := this.GetNotFullRoom(gtype)
    if room == nil {
        return
    }
    user.roomid = room.Id()
	user.task.AddTaskProgress(Task_Join, 1)
    member := &msg.RoomMemberInfo{Uid : pb.Int64(int64(user.Id())), Name : pb.String(user.Name()), Answer : pb.Int32(util.RandBetween(1,2))}
    room.AddMember(member, int32(tbl.Global.Gametype[gtype]))
}

func (this *GameRoomSvrManager) AnswerQuestion(user *GateUser, answer int32) {
    room := this.FindRoom(user.roomid)
    if room == nil {
        return
    }
    room.AnswerQuestion(int64(user.Id()), answer)
    log.Info("玩家[%d] 开始答题游戏, 答案为:%d", user.Id(), answer)
}

func (this *GameRoomSvrManager) LeaveGame(user *GateUser) {
    room := this.FindRoom(user.roomid)
    if room == nil {
        return
    }
    room.DelMember(int64(user.Id()))
    log.Info("玩家[%d] 离开游戏, 房间[%d]", user.Id(), room.Id())    
}


