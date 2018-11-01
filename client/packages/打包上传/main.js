'use strict';
var client = require('scp2');
var moment = require('moment');
var path = require('path');
var process = require('child_process');
var async = require('async');
var Client = require('ssh2').Client;
var rimraf = require('rimraf');

module.exports = {
    load() {
        // execute when package loaded
    },

    unload() {
        // execute when package unloaded
    },

    // register your ipc messages here
    messages: {
        'uploadOutNormalTest'() {
            // open entry panel registered in package.json
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/familyFight/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });


                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'LiuKai',
                        password: 'Linanana456'
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/web-mobile');
                    Editor.log(sourcePath);
                    client.scp(sourcePath, {
                        host: '210.73.214.68',
                        username: 'LiuKai',
                        password: 'Linanana456',
                        path: '/var/www/html/familyFight/'
                    }, function (err) {
                        anext(err);
                    });
                }
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });

        },
        'uploadOutTVPacketTest'() {
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/supermarttvtest/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });


                    }).connect({
                        host: '210.73.214.68',
                        port: 22,
                        username: 'LiuKai',
                        password: 'Linanana456'
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/web-mobile');
                    Editor.log(sourcePath);
                    client.scp(sourcePath, {
                        host: '210.73.214.68',
                        username: 'LiuKai',
                        password: 'Linanana456',
                        path: '/var/www/html/supermarttvtest/'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourceBgPath = path.join(__dirname, '../../assets/resources/Image/BackGround/loading_bg.jpg');
                    client.scp(sourceBgPath, {
                        host: '210.73.214.68',
                        username: 'LiuKai',
                        password: 'Linanana456',
                        path: '/var/www/html/supermarttvtest/'
                    }, function (err) {
                        anext(err);
                    });
                },
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        },
        'uploadOutTVPacketRelease'() {
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/supermarttv/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });


                    }).connect({
                        host: '210.73.214.67',
                        port: 22,
                        username: 'gaozhengshuang',
                        password: 'EJeRXDPkA8'
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/web-mobile');
                    client.scp(sourcePath, {
                        host: '210.73.214.67',
                        username: 'gaozhengshuang',
                        password: 'EJeRXDPkA8',
                        path: '/var/www/html/supermarttv/'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourceBgPath = path.join(__dirname, '../../assets/resources/Image/BackGround/loading_bg.jpg');
                    client.scp(sourceBgPath, {
                        host: '210.73.214.67',
                        username: 'gaozhengshuang',
                        password: 'EJeRXDPkA8',
                        path: '/var/www/html/supermarttv/'
                    }, function (err) {
                        anext(err);
                    });
                },
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        },
        'uploadWechatRelease'() {
            async.waterfall([
                function (anext) {
                    Editor.log('开始删除旧版本 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let conn = new Client();
                    conn.on('ready', function () {
                        Editor.log('ssh 连接成功');

                        conn.exec('rm -rf /var/www/html/gongdou/*', function (err, stream) {
                            if (err) {
                                anext(err);
                            }
                            stream.on('close', function (code, signal) {
                                Editor.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
                                conn.end();
                                anext();
                            }).on('data', function (data) {
                                Editor.log('STDOUT: ' + data);
                            }).stderr.on('data', function (data) {
                                Editor.log('STDERR: ' + data);
                            });
                        });


                    }).connect({
                        host: '210.73.214.75',
                        port: 22,
                        username: 'liuk',
                        password: 'UcxxAoxpnLGUj8hW'
                    });
                },
                function (anext) {
                    Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../build/wechatgame/res/raw-assets');
                    client.scp(sourcePath, {
                        host: '210.73.214.75',
                        username: 'liuk',
                        password: 'UcxxAoxpnLGUj8hW',
                        path: '/var/www/html/gongdou/res/raw-assets'
                    }, function (err) {
                        anext(err);
                    });
                },
                // function (anext) {
                //     Editor.log('开始上传 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                //     let sourcePath = path.join(__dirname, '../../build/wechatgame/res/raw-internal');
                //     client.scp(sourcePath, {
                //         host: '210.73.214.75',
                //         username: 'liuk',
                //         password: 'UcxxAoxpnLGUj8hW',
                //         path: '/var/www/html/gongdou/res/raw-internal'
                //     }, function (err) {
                //         anext(err);
                //     });
                // },
                function (anext) {
                    Editor.log('上传通用素材 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    let sourcePath = path.join(__dirname, '../../images');
                    client.scp(sourcePath, {
                        host: '210.73.214.75',
                        username: 'liuk',
                        password: 'UcxxAoxpnLGUj8hW',
                        path: '/var/www/html/gongdou/images'
                    }, function (err) {
                        anext(err);
                    });
                },
                function (anext) {
                    Editor.log('删除本地res ' + moment().format('YYYY-MM-DD hh:mm:ss'));
                    rimraf(path.join(__dirname, '../../build/wechatgame/res/raw*'), function (err) {
                        anext(err);
                    });
                },
            ], function (err) {
                if (err) {
                    Editor.log('上传错误 ' + err);
                    return;
                }
                Editor.log('上传成功 ' + moment().format('YYYY-MM-DD hh:mm:ss'));
            });
        }
    },
};