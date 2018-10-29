package main

import (
	"encoding/json"
	"fmt"
	"net/http"

	"gitee.com/jntse/gotoolkit/log"
	"gitee.com/jntse/gotoolkit/net"
	"gitee.com/jntse/gotoolkit/util"
	"gitee.com/jntse/minehero/server/tbl"
)

//HTTPArguBaseCmd Http指令解析
type HTTPArguBaseCmd struct {
	GMCmd string
}

//HTTPArguWxLogin Http微信登录参数
type HTTPArguWxLogin struct {
	TempAuthCode string // 微信临时登录凭证code
}

//HTTPRespWxLogin Http微信登录返回结果
type HTTPRespWxLogin struct {
	Openid      string // 用户唯一标识
	Session_key string //会话密钥
	Unionid     string // 用户在开放平台的唯一标识符
}

//HTTPServerResponseCallBack TODO：回调函数有http底层单独的协程调用，想要单线程处理可以将数据push到主线程chan中
func HTTPServerResponseCallBack(w http.ResponseWriter, urlpath string, rawquery string, body []byte) {
	log.Info("HTTPServerResponseCallBack[rid=%d]", util.GetRoutineID())

	//
	log.Info("urlpath: %s", urlpath)
	log.Info("rawquery: %s", rawquery)
	log.Info("body: %s", string(body))
	respjson := ""

	switch {
	default:
		// 基础解析
		objcmd := &HTTPArguBaseCmd{}
		objerror := json.Unmarshal(body, objcmd)
		if objerror != nil {
			log.Error("HttpServerResponseCallBack json.Unmarshal to HttpArguBaseCmd err[%s]", objerror)
			respjson = PackHTTPResponse(1, "无法解析json参数")
			break
		}

		// 注册账户
		if objcmd.GMCmd == "wx_login" {
			errcode, errmsg := HTTPWxLogin(body)
			respjson = PackHTTPResponse(errcode, errmsg)
			break
		}

		// GM指令
		cmdmap := make(map[string]interface{})
		unerr := json.Unmarshal(body, &cmdmap)
		if unerr != nil {
			log.Error("HttpServerResponseCallBack json.Unmarshal to map[string]interface{} err[%s]", unerr)
			respjson = PackHTTPResponse(1, "无法解析json参数")
			break
		}

		if _, ok := cmdmap["gmcmd"]; ok {
			gmcommands := make(map[string]string)
			for k, v := range cmdmap {
				gmcommands[k] = v.(string)
			}
			DoGMCmd(gmcommands)
			respjson = PackHTTPResponse(0, "")
			break
		}
	}

	// header 属性设置
	head := w.Header()
	head.Set("Content-Type", "text/plain; charset=utf-8") // default
	head.Set("Access-Control-Allow-Origin", "*")          // 允许客户端跨域
	//head.Set("Content-Type", "application/json")
	//head.Set("Content-Type", "application/x-www-form-urlencoded")

	// ret code
	w.WriteHeader(http.StatusOK)
	//w.WriteHeader(http.StatusNotFound)
	w.Write([]byte(respjson))
}

//PackHTTPResponse 打包response
func PackHTTPResponse(errcode int32, msg string) string {
	return fmt.Sprintf(`{"status":%d, "msg":"%s"}`, errcode, msg)
}

//DoGMCmd 执行gm指令
func DoGMCmd(cmd map[string]string) {
	value, ok := cmd["gmcmd"]
	if !ok {
		log.Error("找不到gmcmd字段")
		return
	}

	switch value {
	case "reload":
		DoReload(cmd)
		break
	}
}

//DoReload 重新加载
func DoReload(cmd map[string]string) {
	Login().Reload()
}

//HTTPWxLogin 微信登录
func HTTPWxLogin(body []byte) (errcode int32, errmsg string) {
	objcmd := &HTTPArguWxLogin{}
	objerror := json.Unmarshal(body, objcmd)
	if objerror != nil {
		log.Error("json.Unmarshal to HttpArguRegitstAccount err[%s]", objerror)
		return 1, "解除json参数失败"
	}

	if objcmd.TempAuthCode == "" {
		return 1, "临时登录凭证code是空"
	}

	//
	url := fmt.Sprintf(tbl.Global.WechatMiniGame.Jscode2Session, tbl.Global.WechatMiniGame.AppID, tbl.Global.WechatMiniGame.AppSecret, objcmd.TempAuthCode)
	resp, err := network.HttpGet(url)
	if err != nil {
		log.Error("HttpWxLogin http请求错误 err[%s]", err)
		return 1, "http请求错误"
	}

	objResp := &HTTPRespWxLogin{}
	unerr := json.Unmarshal(resp.Body, objResp)
	if unerr != nil {
		log.Error("HttpWxLogin Json Unmarshal失败 err[%s]", unerr)
		return 1, "Json Unmarshal失败"
	}

	if objResp.Openid == "" || objResp.Session_key == "" {
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
