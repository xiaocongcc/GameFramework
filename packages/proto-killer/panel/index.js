let packageName = "proto-killer";
let fs = require('fire-fs');
let path = require('fire-path');
let Electron = require('electron');

let configUtil = Editor.require('packages://' + packageName + '/core/config-util.js');
let protoItem = Editor.require('packages://' + packageName + '/panel/item/protoItem.js');
let protoProcessor = Editor.require('packages://' + packageName + '/core/proto-processor.js');

let projectPath = Editor.Project.path;

Editor.Panel.extend({

    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",

    $: {
        logTextArea: '#logTextArea',
    },

    ready() {
        let logCtrl = this.$logTextArea;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };

        protoItem.init();

        this.plugin = new window.Vue({
            el: this.shadowRoot,

            data: {
                logView: '',

                protoRootPath: null,
                outputPath: null,

                protoFileArr: null,
                protoDataArr: null,
            },

            init() {
                // Editor.info('init...');
            },
            created() {
                // Editor.info('created...');
                this._initConfig();
            },

            methods: {
                _initConfig() {
                    configUtil.initCfg((data) => {
                        this.protoRootPath = data.protoRootPath;
                        this.outputPath = data.outputPath;

                        if (this.protoRootPath != "" && fs.existsSync(this.protoRootPath)) {
                            this._onFindAllProtoFile(this.protoRootPath);
                        }
                    });
                },
                _saveConfig() {
                    let data = {
                        protoRootPath: this.protoRootPath,
                        outputPath: this.outputPath
                    };
                    configUtil.saveCfg(data);
                },
                _addLog(str) {
                    let time = new Date();
                    // this.logView = "[" + time.toLocaleString() + "]: " + str + "\n" + this.logView;
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },

                // 选择目录
                onBtnClickSelectProtoRootPath() {
                    let res = Editor.Dialog.openFile({
                        title: "选择Proto的根目录",
                        defaultPath: projectPath,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        if (dir !== this.protoRootPath) {
                            this.protoRootPath = dir;
                            this._onFindAllProtoFile(dir);
                            this._saveConfig();
                        }
                    }
                },
                // 打开目录
                onBtnClickOpenProtoRootPath() {
                    if (fs.existsSync(this.protoRootPath)) {
                        Electron.shell.showItemInFolder(this.protoRootPath);
                        Electron.shell.beep();
                    } else {
                        this._addLog("目录不存在：" + this.protoRootPath);
                    }
                },
                // 刷新目录
                onBtnClickFreshProto() {
                    this._onFindAllProtoFile(this.protoRootPath);
                },
                // 生成
                onBtnClickGen() {
                    this.logView = '';
                    let str = protoProcessor.deal(this.protoDataArr);
                    this._writeToFile(str);
                },

                // 查找出目录下所有的proto文件
                _onFindAllProtoFile(dir) {
                    if (dir) {
                        let allFileArr = [];
                        let protoFileArr = [];
                        // 获取目录下所有的文件
                        readDirSync(dir);
                        // 过滤.json文件
                        for (let key in allFileArr) {
                            let file = allFileArr[key];
                            let extName = path.extname(file);
                            if (extName === '.proto') {
                                protoFileArr.push(file);
                            }
                        }
                        this.protoFileArr = protoFileArr;

                        this.protoDataArr = [];
                        for (let i = 0; i < protoFileArr.length; i++) {
                            let itemFullPath = protoFileArr[i];
                            let itemData = {
                                isUse: true,
                                fullPath: itemFullPath,
                                name: 'name'
                            };
                            itemData.name = itemFullPath.substr(dir.length + 1, itemFullPath.length - dir.length);
                            this.protoDataArr.push(itemData);
                        }

                        function readDirSync(dirPath) {
                            let dirInfo = fs.readdirSync(dirPath);
                            for (let i = 0; i < dirInfo.length; i++) {
                                let item = dirInfo[i];
                                let itemFullPath = path.join(dirPath, item);
                                let info = fs.statSync(itemFullPath);
                                if (info.isDirectory()) {
                                    // this._addLog('dir: ' + itemFullPath);
                                    readDirSync(itemFullPath);
                                } else if (info.isFile()) {
                                    allFileArr.push(itemFullPath);
                                    // this._addLog('file: ' + itemFullPath);
                                }
                            }
                        }

                    }
                },

                _writeToFile(str) {
                    let writePath = projectPath + `\\${this.outputPath}`;
                    fs.writeFileSync(writePath, str, {
                        encoding: 'utf8',
                        flag: 'w'
                    });
                    this._addLog(`proto自动写入成功 ==> ${writePath}`);
                }
            }
        });
    },

    messages: {
        'proto-killer:hello'(event) {

        }
    }
});