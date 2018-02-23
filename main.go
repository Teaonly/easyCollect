package main

import (
    "flag"
    "fmt"
    "io/ioutil"
    "encoding/json"
    /*
    "net/http"
	"strings"
	"log"
    "github.com/aliyun/aliyun-oss-go-sdk/oss"
    */
)

/* basic struct define */
type Config  struct {
	OssConfig struct {
		EndPoint string `json:"end_point"`
		Key      string `json:"key"`
		Path     string `json:"path"`
		Secret   string `json:"secret"`
	} `json:"ossConfig"`
}

func check(e error) {
    if e != nil {
        panic(e)
    }
}

func main() {
    configFile := flag.String("config", "./config.json", "Config file name")
    //command := flag.String("command", "view", "do command: view|import|sync")
    //source := flag.String("source", "weibo", "import source: weibo|github|arxiv")
    flag.Parse()

    // load config file
    myConfig := Config{}
    dat, err := ioutil.ReadFile(*configFile)
    check(err)
    json.Unmarshal(dat, &myConfig)

    fmt.Printf(myConfig.OssConfig.EndPoint)

    // sync whith OSS
}

