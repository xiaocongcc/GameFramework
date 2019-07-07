let packageName = "ui-creator";
let fs = require('fire-fs');
let path = require('fire-path');
let Electron = require('electron');

let configUtil = Editor.require('packages://' + packageName + '/core/config-util.js');

let projectPath = Editor.Project.path;

Editor.Panel.extend({
    style: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.css', 'utf8')) + "",
    template: fs.readFileSync(Editor.url('packages://' + packageName + '/panel/index.html', 'utf8')) + "",

    ready() {

        new window.Vue({
            el: this.shadowRoot,

            init() {

            },

            created() {
                this._initConfig();
            },


            data: {
                nodeOutputPath: null,
                uiOutputPath: null,
            },

            methods: {
                _initConfig() {
                    configUtil.initCfg((data) => {
                        this.nodeOutputPath = data.nodeOutputPath;
                        this.uiOutputPath = data.uiOutputPath;
                    });
                },
                _saveConfig() {
                    let data = {
                        nodeOutputPath: this.nodeOutputPath,
                        uiOutputPath: this.uiOutputPath
                    };
                    configUtil.saveCfg(data);
                },
                onBtnSelectNodePath() {
                    let res = Editor.Dialog.openFile({
                        title: "选择UI节点树脚本输出路径",
                        defaultPath: projectPath,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        if (dir !== this.nodeOutputPath) {
                            this.nodeOutputPath = dir;
                        }
                    }
                },
                onBtnOpenNodePath() {
                    let fullPath = path.join(projectPath, this.nodeOutputPath);
                    if (fs.existsSync(fullPath)) {
                        Electron.shell.showItemInFolder(fullPath);
                        Electron.shell.beep();
                    }
                },
                onBtnSelectUIPath() {
                    let res = Editor.Dialog.openFile({
                        title: "选择UI逻辑脚本输出路径",
                        defaultPath: projectPath,
                        properties: ['openDirectory'],
                    });
                    if (res !== -1) {
                        let dir = res[0];
                        if (dir !== this.uiOutputPath) {
                            this.uiOutputPath = dir;
                        }
                    }
                },
                onBtnOpenUIPath() {
                    let fullPath = path.join(projectPath, this.uiOutputPath);
                    if (fs.existsSync(fullPath)) {
                        Electron.shell.showItemInFolder(fullPath);
                        Electron.shell.beep();
                    }
                },
            }
        });
    }
});