package main
import (
	"fmt"
	"strconv"
	"net/http"
	"encoding/json"
	_"github.com/go-redis/redis"
	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/minehero/server/def"
	"gitee.com/jntse/minehero/server/tbl"
)

// 定义Http解析参数 字段名首字母必须大写
type HttpArguBaseCmd struct {
	GMCmd string
}

type HttpArguAccountAuthCode struct {
	GMCmd string
	Phone string
}

type HttpArguRegitstAccount struct {
	GMCmd 		string
	Phone 		string
	Passwd 		string
	Authcode 	string
	Invitationcode string
	Nickname	string
}

type HttpArguWxLogin struct {
	TempAuthCode string	// 微信临时登录凭证code
}

type HttpRespWxLogin struct {
	Openid	string	// 用户唯一标识
	Session_key	string 	//会话密钥
	Unionid	string	// 用户在开放平台的唯一标识符
}


// TODO：回调函数有http底层单独的协程调用，想要单线程处理可以将数据push到主线程chan中
func HttpServerResponseCallBack(w http.ResponseWriter, urlpath string, rawquery string, body []byte) {
	log.Info("HttpServerResponseCallBack[rid=%d]", util.GetRoutineID())

	//
	log.Info("urlpath: %s", urlpath)
	log.Info("rawquery: %s", rawquery)
	log.Info("body: %s", string(body))
	respjson := ""

	switch {
	default:

		// 基础解析
		objcmd := &HttpArguBaseCmd{}
		objerror := json.Unmarshal(body, objcmd)
		if objerror != nil {
			log.Error("HttpServerResponseCallBack json.Unmarshal to HttpArguBaseCmd err[%s]", objerror)
			respjson = PackHttpResponse(1, "无法解析json参数")
			break
		}

		// 注册账户
		if objcmd.GMCmd == "registauthcode" {
			errcode, errmsg := HttpGetRegistAuthCode(body)
			respjson = PackHttpResponse(errcode, errmsg)
			break
		}else if objcmd.GMCmd == "registaccount" {
			errcode, errmsg := HttpRegistAccount(body)
			respjson = PackHttpResponse(errcode, errmsg)
			break
		}else if objcmd.GMCmd == "wx_login" {
			errcode, errmsg := HttpWxLogin(body)
			respjson = PackHttpResponse(errcode, errmsg)
			break
		}


		// GM指令
		cmdmap := make(map[string]interface{})
		unerr := json.Unmarshal(body, &cmdmap)
		if unerr != nil {
			log.Error("HttpServerResponseCallBack json.Unmarshal to map[string]interface{} err[%s]", unerr)
			respjson = PackHttpResponse(1, "无法解析json参数")
			break
		}

		if _ , ok := cmdmap["gmcmd"]; ok {
			gmcommands:= make(map[string]string)
			for k ,v := range cmdmap { gmcommands[k] = v.(string) }
			errcode, errmsg := DoGMCmd(gmcommands)
			respjson = PackHttpResponse(errcode, errmsg)
			break
		}
	}


	// header 属性设置
	head := w.Header()
	head.Set("Content-Type", "text/plain; charset=utf-8")       // default
	head.Set("Access-Control-Allow-Origin", "*")       // 允许客户端跨域
	//head.Set("Content-Type", "application/json")
	//head.Set("Content-Type", "application/x-www-form-urlencoded")
	w.WriteHeader(http.StatusOK)
	//w.WriteHeader(http.StatusNotFound)
	//w.Write([]byte("hello golang http test"))
	w.Write([]byte(respjson))
}

func PackHttpResponse(errcode int32, msg string) string {
	return fmt.Sprintf(`{"status":%d, "msg":"%s"}`, errcode, msg)
}

// GM指令处理
func DoGMCmd(cmd map[string]string) (errcode int32, errmsg string) {
	value, ok := cmd["gmcmd"]
	if !ok {
		log.Error("找不到gmcmd字段")
		return 1, "找不到gmcmd字段"
	}

	switch value {
	case "reload":
		return DoReload(cmd)
	case "wechatpay":
		return DoWeChatPay(cmd)
	case "wxbalance":
		return DoWechatBalance(cmd)
	case "wxpresentmoney":
		return DoWechatPresentMoney(cmd)
	case "wxpaymoney":
		return DoWechatPayMoney(cmd)
	}

	return 1, "错误的cmd类型"
}

func DoReload(cmd map[string]string) (errcode int32, errmsg string) {
	Login().Reload()
	return 0 , "Reload OK"
}

func DoWeChatPay(cmd map[string]string) (errcode int32, errmsg string) {
	openid , amount := cmd["openid"], cmd["amount"]
	num , _:= strconv.ParseInt(amount, 10, 32)
	def.HttpWechatCompanyPay(openid, num, "测试企业转账零钱")
	return 0, "DoWeChatPay OK"
}

func DoWechatBalance(cmd map[string]string) (errcode int32, errmsg string) {
	openid := cmd["openid"]
	def.HttpWechatMiniGameGetBalance(Redis(), openid)
	return 0, "DoWechatBalance OK"
}

func DoWechatPresentMoney(cmd map[string]string) (errcode int32, errmsg string) {
	openid := cmd["openid"]
	count, _ := strconv.ParseInt(cmd["count"], 10, 64)
	def.HttpWechatMiniGamePresentMoney(Redis(), openid, count)
	return 0, "DoWechatGetPresentMoney OK"
}

func DoWechatPayMoney(cmd map[string]string) (errcode int32, errmsg string) {
	openid := cmd["openid"]
	count, _ := strconv.ParseInt(cmd["count"], 10, 64)
	def.HttpWechatMiniGamePayMoney(Redis(), openid, count)
	return 0, "DoWechatPayMoney OK"
}


func HttpGetRegistAuthCode(body []byte) (errcode int32, errmsg string) {
	objcmd := &HttpArguAccountAuthCode{}
	objerror := json.Unmarshal(body, objcmd)
	if objerror != nil {
		log.Error("json.Unmarshal to HttpArguAccountAuthCode err[%s]", objerror)
		return 1, "解析json参数失败"
	}

	if errmsg := GetRegistAuthCode(objcmd.Phone); errmsg != "" {
		return 1, errmsg
	}

	return 0, "成功"
}

func HttpRegistAccount(body []byte) (errcode int32, errmsg string) {
	objcmd := &HttpArguRegitstAccount{}
	objerror := json.Unmarshal(body, objcmd)
	if objerror != nil {
		log.Error("json.Unmarshal to HttpArguRegitstAccount err[%s]", objerror)
		return 1, "解除json参数失败"
	}

	phone, passwd, authcode, invitationcode := objcmd.Phone, objcmd.Passwd, objcmd.Authcode, objcmd.Invitationcode
	nickname, account := objcmd.Nickname, phone

	switch {
	default:
		if errmsg = RegistAccountCheck(account, passwd, invitationcode, authcode, nickname); errmsg != "" {
			break
		}

		// 验证通过
		if errmsg = RegistAccount(account, passwd, invitationcode, nickname, "", ""); errmsg != "" {
			break
		}
	}

	// 回复客户端
	if errmsg != "" { 
		log.Info("[注册] 账户[%s] 注册失败[%s]", phone, errmsg)
		return 1, errmsg
	}
	return 0, "成功"
}


func HttpWxLogin(body []byte) (errcode int32, errmsg string) {
	objcmd := &HttpArguWxLogin{}
	objerror := json.Unmarshal(body, objcmd)
	if objerror != nil {
		log.Error("json.Unmarshal to HttpArguRegitstAccount err[%s]", objerror)
		return 1, "解除json参数失败"
	}

	if objcmd.TempAuthCode == "" {
		return 1, "临时登录凭证code是空"
	}

	//
	url := fmt.Sprintf(tbl.Global.WechatMiniGame.Jscode2Session, tbl.Global.Wechat.AppID, tbl.Global.Wechat.AppSecret, objcmd.TempAuthCode)
	resp, err := network.HttpGet(url)
	if err != nil {
		log.Error("HttpWxLogin http请求错误 err[%s]", err)
		return 1, "http请求错误"
	}

	objResp := &HttpRespWxLogin{}
	unerr := json.Unmarshal(resp.Body, objResp)
	if unerr != nil {
		log.Error("HttpWxLogin Json Unmarshal失败 err[%s]", unerr)
		return 1, "Json Unmarshal失败"
	}

	if objResp.Openid == ""  || objResp.Session_key == "" {
		log.Error("HttpWxLogin 获取OpenId失败 resp[%s]", resp.Body)
		return 1, "获取OpenId失败"
	}

	// 绑定Openid和Session_key
	setkey := fmt.Sprintf("wechat_openid_%s_sessionkey", objResp.Openid)
	_, seterr := Redis().Set(setkey, objResp.Session_key, 0).Result()
	if seterr != nil {
		return 1, "绑定Openid和Session_key失败"
	}

	reply := fmt.Sprintf("%s", objResp.Openid)
	return 0, reply
}


