package main
import (
	"time"
	"fmt"
	"net"
	"gitee.com/jntse/gotoolkit/log"
)

type UdpServer struct {
	ip string
	port int32
	listener *net.UDPConn
	running bool
}

func NewUdpServer() *UdpServer {
	return new(UdpServer)
}

func (this *UdpServer) Host() string {
	return fmt.Sprintf("%s:%d", this.ip, this.port)
}

func (this *UdpServer) Read() bool {
	this.listener.SetReadDeadline(time.Now().Add(time.Millisecond* 10))
	data := make([]byte, 2048)
	n, raddr, err := this.listener.ReadFromUDP(data)
	if err != nil {
		if nerr, convertok := err.(net.Error); convertok && nerr.Timeout() {
			return true 
		}
		fmt.Printf("error during read: %s\n", err)
		return false
	}
	fmt.Printf("receive %s from %s\n", data[:n], raddr.String())
	this.Write(raddr)
	return true
}

func (this *UdpServer) Write(addr *net.UDPAddr) {
	sendbuf := []byte("server msg")
	n, err := this.listener.WriteToUDP(sendbuf, addr)
	if err != nil {
		fmt.Printf("error during write:%s\n", err)
		return
	}
	fmt.Printf("send %d bytes ok\n", n)

}

func (this *UdpServer) Init(ip string, port int32) {
	this.ip = ip
	this.port = port
}

func (this *UdpServer) Start() {
	addr, err_resolve := net.ResolveUDPAddr("udp", this.Host())
	if err_resolve != nil {
		log.Error("'%s' ResolveUDPAddr error:%v", this.Host(), err_resolve)
		return
	}

	conn, err := net.ListenUDP("udp", addr)
	if err != nil {
		fmt.Println(err)
		panic(err)
		return
	}
	this.listener = conn
	this.running = true
	log.Info("listen[%s] ok", this.Host())

	go this.run()
}

func (this *UdpServer) Shutdown() {
	this.running = true
	this.listener.Close()
}

func (this *UdpServer) run() {
	for ;; {
		if this.running == false {
			break
		}
		this.Read()
		time.Sleep(time.Second)
	}
}


