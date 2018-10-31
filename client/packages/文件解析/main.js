'use strict';
var fs = require('fs');
var async = require('async');
var node_xj = require('xls-to-json');
var process = require('child_process');
var path = require('path');

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'genJson'() {
            let fileNames = [
                'proto_index',
                'dialoguebase',
                'maidlevelbase',
                'maidshopbase',
                'passlevelsbase',
                'turnbrandbase',
                'palacemapbase',
                'palacemapmaidbase',
                'palacemapmasterlevelsbase',
                'itembase',
                'common',
                'headbase',
                'eventbase',
                'boxbase',
                'guidebase',
                'palacepersonnelbase',
                'functionopenbase',
                'palacepartbase',
                'lovedialoguebase',
                'dateeventbase',
                'sharebase'
            ];
            Editor.log('开始生成JSON');

            async.timesSeries(fileNames.length, function (n, tnext) {
                let sourcePath = __dirname + '\\..\\..\\..\\docs\\tbl\\' + fileNames[n] + '.json';
                if (!fs.existsSync(sourcePath)) {
                    sourcePath = __dirname + '\\..\\..\\..\\docs\\json\\' + fileNames[n] + '.json';
                }
                let targetFile = __dirname + '\\..\\..\\assets\\resources\\Json\\';
                let cmd = 'copy ' + sourcePath + ' ' + targetFile;
                process.exec(cmd, function (err, stdout, stderr) {
                    if (err) {
                        tnext(err);
                    } else {
                        tnext();
                    }
                });
            }, function (err) {
                if (err) {
                    Editor.log('++++++ Json 错误 ++++++' + JSON.stringify(err));
                } else {
                    Editor.log('生成成功');
                }
            });
        },
        'genProto'() {
            Editor.log('开始生成ProtoMsg');
            let sourcePath = __dirname + '\\..\\..\\..\\protocol\\*.proto';
            let targetFile = __dirname + '\\..\\..\\assets\\Script\\Util\\ProtoMsg.js';
            let cmd = 'pbjs -t static-module -w commonjs -o ' + targetFile + '  ' + sourcePath;
            process.exec(cmd, function (err, stdout, stderr) {
                if (err) {
                    Editor.log('++++++ 生成ProtoMsg 错误 ++++++' + err);
                } else {
                    Editor.log('生成成功');
                }
            });
        }
    },
};