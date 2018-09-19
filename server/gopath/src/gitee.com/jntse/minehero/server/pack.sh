#!/bin/bash
#报错就停止
#set -e

##编译新版本
./build.py

##拷贝文件
mkdir -p ./release
mkdir -p ./pack
rm -rf release/*
mkdir -p ./release/conf
mkdir -p ./release/bin
mkdir -p ./release/tbl/excel
mkdir -p ./release/tbl/json

cp -v gateserver/gateserver ./release/bin/
cp -v loginserver/loginserver ./release/bin/
cp -v matchserver/matchserver ./release/bin/
cp -v roomserver/roomserver ./release/bin/
cp -v watch.sh ./release/
cp -v runserver.sh ./release/
cp -v version.txt ./release/

cp -r conf/* ./release/conf/
cp -r tbl/excel/* ./release/tbl/excel
cp -r tbl/json/* ./release/tbl/json
find ./release/conf/ -iname "*.example" | xargs rm -f

filename=webgame-release-`date +%Y%m%d%H%M`.`uname -m`.tar.gz
tar -czvf pack/$filename ./release/
today=`date +%Y%m%d`

## 测试环境版本
wainum=$(ssh gofamilyfight@210.73.214.72 "ls -d -l /home/gofamilyfight/version/${today}R* | wc -l")
wainum=$((wainum + 1))
waibuildDirName=${today}R${wainum}_PP
echo $waibuildDirName

ssh gofamilyfight@210.73.214.72 "mkdir -p /home/gofamilyfight/version/${waibuildDirName}"
scp pack/$filename gofamilyfight@210.73.214.72:/home/gofamilyfight/version/${waibuildDirName}
ssh gofamilyfight@210.73.214.72 "cd /home/gofamilyfight/version/${waibuildDirName}/ && tar xzvf *.tar.gz"
ssh gofamilyfight@210.73.214.72 "rm /home/gofamilyfight/version/${waibuildDirName}/release/conf -rf"
ssh gofamilyfight@210.73.214.72 "cp /home/gofamilyfight/version/config/conf /home/gofamilyfight/version/${waibuildDirName}/release/ -rvf"
ssh gofamilyfight@210.73.214.72 "cp /home/gofamilyfight/version/config/runserver.sh /home/gofamilyfight/version/${waibuildDirName}/release/ -rvf"
ssh gofamilyfight@210.73.214.72 "cp /home/gofamilyfight/version/config/watch.sh /home/gofamilyfight/version/${waibuildDirName}/release/ -rvf"

## 正式环境版本
#ssh webgame@210.73.214.68 "scp -r /home/webgame/version/${waibuildDirName} webgame@210.73.214.75:/home/webgame/version/"
#ssh webgame@210.73.214.68 "scp -r /home/webgame/version/${waibuildDirName} webgame@210.73.214.76:/home/webgame/version/"
#ssh webgame@210.73.214.68 "scp -r /home/webgame/version/${waibuildDirName} webgame@210.73.214.77:/home/webgame/version/"

#ssh webgame@210.73.214.75 "cd /home/webgame/version/${waibuildDirName}/ && tar xzvf *.tar.gz"
#ssh webgame@210.73.214.75 "rm /home/webgame/version/${waibuildDirName}/release/conf -rf"
#ssh webgame@210.73.214.75 "cp /home/webgame/version/config/conf /home/webgame/version/${waibuildDirName}/release/ -rvf"
#ssh webgame@210.73.214.75 "cp /home/webgame/version/config/runserver.sh /home/webgame/version/${waibuildDirName}/release/ -rvf"
#ssh webgame@210.73.214.75 "cp /home/webgame/version/config/watch.sh /home/webgame/version/${waibuildDirName}/release/ -rvf"

#ssh webgame@210.73.214.76 "cd /home/webgame/version/${waibuildDirName}/ && tar xzvf *.tar.gz"
#ssh webgame@210.73.214.76 "rm /home/webgame/version/${waibuildDirName}/release/conf -rf"
#ssh webgame@210.73.214.76 "cp /home/webgame/version/config/conf /home/webgame/version/${waibuildDirName}/release/ -rvf"
#ssh webgame@210.73.214.76 "cp /home/webgame/version/config/runserver.sh /home/webgame/version/${waibuildDirName}/release/ -rvf"
#ssh webgame@210.73.214.76 "cp /home/webgame/version/config/watch.sh /home/webgame/version/${waibuildDirName}/release/ -rvf"
#
#ssh webgame@210.73.214.77 "cd /home/webgame/version/${waibuildDirName}/ && tar xzvf *.tar.gz"
#ssh webgame@210.73.214.77 "rm /home/webgame/version/${waibuildDirName}/release/conf -rf"
#ssh webgame@210.73.214.77 "cp /home/webgame/version/config/conf /home/webgame/version/${waibuildDirName}/release/ -rvf"
#ssh webgame@210.73.214.77 "cp /home/webgame/version/config/runserver.sh /home/webgame/version/${waibuildDirName}/release/ -rvf"
#ssh webgame@210.73.214.77 "cp /home/webgame/version/config/watch.sh /home/webgame/version/${waibuildDirName}/release/ -rvf"

