package main
import (
	_"fmt"
	"time"
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/util"
)

var g_Quit bool = false
var g_KeyBordInput util.KeyBordInput
var g_CmdArgs CmdlineArgument

type CmdlineArgument struct {
	Conf        string
	Logname     string
	Logpath     string
	Loglvl      string
	Daemon      bool
	EventStat   bool
	PProf       int64
	Ver         string
	Client		bool
}

// 命令行参数解析
func init() {
	util.DoCmdLineParse(&g_CmdArgs)
	//if g_CmdArgs.Conf == ""         	{ panic("-----input '-conf' cmdline argu-----")     }
	//if g_CmdArgs.Logname == ""      	{ panic("-----input '-logname' cmdline argu-----")  }
	//if g_CmdArgs.Logpath == ""      	{ panic("-----input '-logpath' cmdline argu-----")  }
	//if g_CmdArgs.Loglvl == ""       	{ panic("-----input '-loglvl' cmdline argu-----")   }
	//if g_CmdArgs.PProf == 0         	{ panic("-----input '-pprof' cmdline argu-----")   }

}

func main() {
	log.Init("","","trace")
	log.Info("初始日志完成")

	if g_CmdArgs.Client == false {
		server := NewUdpServer()
		server.Init("192.168.30.203", 7004)
		server.Start()
	}else {
		client := NewUdpClient()
		client.Init("192.168.30.203", 7004)
		client.Start()
	}

	for g_Quit == false {
		time.Sleep(time.Millisecond * 10)
		select {
		case cmd,_:= <-g_KeyBordInput.C:
			DoInputCmd(cmd)
		default:
		}
	}
}

func DoInputCmd(cmd string) {
	switch cmd {
	case "quit","exit":
		g_Quit = true
		break
	default:
		break
	}
}


