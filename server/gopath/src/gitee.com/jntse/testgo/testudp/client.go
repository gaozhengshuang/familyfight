package main
import (
	"time"
	"fmt"
	"net"
	"gitee.com/jntse/gotoolkit/log"
)


type UdpClient struct {
	ip string
	port int32
	dialer *net.UDPConn
	running bool
}

func NewUdpClient() *UdpClient {
	return new(UdpClient)
}

func (this *UdpClient) Host() string {
	return fmt.Sprintf("%s:%d", this.ip, this.port)
}

func (this *UdpClient) Read() bool {
	this.dialer.SetReadDeadline(time.Now().Add(time.Millisecond* 10))
	data := make([]byte, 2048)
	n, err := this.dialer.Read(data)
	if err != nil {
		if nerr, convertok := err.(net.Error); convertok && nerr.Timeout() {
			return true 
		}
		fmt.Printf("error during read: %s\n", err)
		return false
	}
	fmt.Printf("receive %s from %v\n", data[:n], this.dialer.RemoteAddr().String())
	return true
}

func (this *UdpClient) Write() bool {
	sendbuf := []byte("client msg")
	n, err := this.dialer.Write(sendbuf)
	if err != nil {
		fmt.Printf("error during write:%s\n", err)
		return false
	}

	fmt.Printf("send %d bytes ok\n", n)
	return true
}

func (this *UdpClient) Init(ip string, port int32) {
	this.ip = ip
	this.port = port
}

func (this *UdpClient) Shutdown() {
	this.running = true
	this.dialer.Close()
}

func (this *UdpClient) Start() {
	addr, err_resolve := net.ResolveUDPAddr("udp", this.Host())
	if err_resolve != nil {
		log.Error("'%s' ResolveUDPAddr error:%v", this.Host(), err_resolve)
		return
	}

	conn, err := net.DialUDP("udp", nil, addr)
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	this.dialer = conn
	this.running = true

	go this.run()
}

func (this *UdpClient) run() {
	for ;; {
		if this.running == false {
			break
		}

		this.Read()
		this.Write()
		time.Sleep(time.Second)
	}
}


