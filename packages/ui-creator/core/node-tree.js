'use strict';

const fs = require('fire-fs');
const path = require('fire-path');
const util = require('util');

const configUtil = require('./config-util');

const projectPath = Editor.Project.path;
const adb = Editor.assetdb;

var outputRelativePath;
var outputFullPath;

var codeNodeInit = '%s: %s;';
var codeAssign = 'this.%s = this.%s.getChildByName("%s");';
var codeAssign2 = 'this.%s = %s.getChildByName("%s");';
var codeBody =
    `const { ccclass } = cc._decorator;

@ccclass
export default class %s extends cc.Component {
%s
    onLoad () {
%s
    }
}
`;

var getWarnMsg = function (warnStr) {
    return {
        type: 'warning',
        buttons: ['OK'],
        titile: 'warning',
        message: warnStr,
        defaultId: 0,
        noLink: true
    };
}

/**获取控件真正的名字：现在的控件名后缀有特定功能，去掉后缀才是控件真正名字 */
var getRealName = function (name) {
    let index = name.indexOf('__');
    if (index == -1) {
        return name;
    }
    name = name.substr(0, index);
    return name;
}

var getAutoUIName = function (url) {
    return 'auto_' + path.basenameNoExt(url);
}

module.exports = {
    init() {
        configUtil.initCfg((data) => {
            outputRelativePath = data.nodeOutputPath;
            outputFullPath = path.join(projectPath, outputRelativePath);
        });
    },

    dealFolder(assetInfo) {
        let url = assetInfo.url;
        if (!fs.existsSync(outputFullPath)) {
            fs.mkdirsSync(outputFullPath);
        }
        let moduleName = path.basenameNoExt(url);

        let moduleFolder = path.join(outputFullPath, moduleName);
        if (!fs.existsSync(moduleFolder)) {
            fs.mkdirsSync(moduleFolder);
        }

        Editor.log('dealFolder : ' + url);
        Editor.assetdb.queryAssets(url + '/**\/*', ['scene', 'prefab'],
            (err, results) => {
                results.forEach((r) => {
                    if (err) {
                        Editor.log('ERROR:' + err);
                    } else {
                        Editor.log('url:' + r.url);
                        this.dealPrefab(r);
                    }
                });
            });
    },

    dealPrefab(assetInfo) {
        if (!fs.existsSync(outputFullPath)) {
            fs.mkdirsSync(outputFullPath);
        }

        let url = assetInfo.url;

        //获取文件夹名称
        let moduleName = path.basenameNoExt(path.dirname(url));
        Editor.log('prefabFunc moduleName:', moduleName);

        //创建对应父文件夹
        let moduleFolder = path.join(outputFullPath, moduleName);
        if (!fs.existsSync(moduleFolder)) {
            fs.mkdirsSync(moduleFolder);
        }

        //生成对应的ts文件
        let uiName = getAutoUIName(url);
        let exportUIPath = `db://${outputRelativePath}/${moduleName}/${uiName}.ts`;

        let nameList = {};
        let sameNameList = [];

        let declareStr = '';
        let nodeInitStr = '';
        let assignStr = '';

        let json = fs.readJsonSync(assetInfo.path);

        let baseNode = json[0];
        let rootNode = json[1];
        let rootType = rootNode['__type__'];
        let rootName = rootNode['_name'];

        let isScene = baseNode['__type__'] == 'cc.SceneAsset';
        if (isScene) {
            let children = rootNode['_children'];
            if (!children || children.length == 0) {
                Editor.Dialog.messageBox(getWarnMsg('这是一个空的场景'));
                return;
            }
            assignStr += `\t\tlet parent = this.node.getParent();\n`;
        } else {
            nodeInitStr += '\t' + util.format(codeNodeInit, rootName, rootType) + '\n';
            assignStr += `\t\tthis.${rootName} = this.node\n`;
        }

        let outputFunc;
        outputFunc = function (root, nodeInfo, isScene) {
            var name = nodeInfo['_name'];
            let type = nodeInfo['__type__'];
            let parent = nodeInfo['_parent'];
            let parentId = parent ? parent['__id__'] : null;
            let parentName = 'node';
            let formatCodeAssign = codeAssign;
            if (parentId) {
                let parentInfo = root[parentId];
                parentName = parentInfo['_name'];
                if (isScene && parentName == undefined) {
                    parentName = 'parent';
                    formatCodeAssign = codeAssign2;
                }
            }

            if (name != rootName && name.indexOf(' ') == -1) {
                //同名控件检查
                if (nameList[name] == undefined) {
                    nameList[name] = true;

                    let realName = getRealName(name);
                    let parentRealName = getRealName(parentName);
                    nodeInitStr += '\t' + util.format(codeNodeInit, realName, type) + '\n';
                    assignStr += '\t\t' + util.format(formatCodeAssign, realName, parentRealName, name) + '\n';
                } else {
                    if (!sameNameList.hasOwnProperty(name)) {
                        sameNameList.push(name);
                    }
                }
            }

            let children = nodeInfo['_children'];
            if (!children || children == []) return;

            for (const childInfo in children) {
                if (children.hasOwnProperty(childInfo)) {
                    const element = children[childInfo];
                    let childID = element['__id__'];

                    let childNode = root[childID];
                    outputFunc(root, childNode, isScene);
                }
            }
        }

        outputFunc(json, rootNode, isScene);

        if (sameNameList.length > 0) {
            let warn = sameNameList.join('\n');
            Editor.log('warn ::' + warn);
            Editor.Dialog.messageBox(getWarnMsg(`输出中有控件命名重复: \n${warn}\n请修改`));
        }

        let urlStr = `\n\tpublic static URL:string = "${url}"\n`;

        declareStr = nodeInitStr + urlStr;
        let exportCode = util.format(codeBody, uiName, declareStr, assignStr);

        if (adb.exists(exportUIPath)) {
            adb.saveExists(exportUIPath, exportCode);
        } else {
            adb.create(exportUIPath, exportCode);
        }
    }
}