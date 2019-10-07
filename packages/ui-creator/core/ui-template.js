'use strict';

const fs = require('fire-fs');
const path = require('fire-path');

const configUtil = require('./config-util');

const projectPath = Editor.Project.path;
const adb = Editor.assetdb;

var outputRelativePath;
var outputFullPath;
var scriptTemplate;
var templatePath;

// 首字母大写
var firstCharUpper = function (str) {
    str = str.substring(0, 1).toUpperCase() + str.substring(1);
    return str;
}

/**
 * 输入：db://assets/resources/prefab/Fight/FightSetting.prefab
 * 输出：Fight/FightSetting
 */
var getPrefabPath = function (url) {
    let prefabStr = 'prefab/'
    let prefabSuffix = '.prefab';
    let start = url.indexOf(prefabStr) + prefabStr.length;
    let end = url.indexOf(prefabSuffix);
    return url.substring(start, end);
}

var getAutoUIName = function (url) {
    return 'auto_' + path.basenameNoExt(url);
}

module.exports = {
    init() {
        configUtil.initCfg((data) => {
            outputRelativePath = data.uiOutputPath;
            outputFullPath = path.join(projectPath, outputRelativePath);
        });
        templatePath = Editor.url('packages://ui-creator/core/ui-template.txt');
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
    },

    dealPrefab(assetInfo) {
        let url = assetInfo.url;
        if (!fs.existsSync(outputFullPath)) {
            fs.mkdirsSync(outputFullPath);
        }

        //获取文件夹名称
        let moduleName = path.basenameNoExt(path.dirname(url));

        //创建对应父文件夹
        let moduleFolder = path.join(outputFullPath, moduleName);
        if (!fs.existsSync(moduleFolder)) {
            fs.mkdirsSync(moduleFolder);
        }

        //生成对应的ts文件
        let uiName = 'UI' + firstCharUpper(path.basenameNoExt(url));
        let exportUIPath = `db://${outputRelativePath}/${moduleName}/${uiName}.ts`;
        let prefabPath = '';
        if (assetInfo.type === 'prefab') {
            prefabPath = getPrefabPath(url);
        }

        let autoUIName = getAutoUIName(url);

        let scriptTemplate = fs.readFileSync(templatePath, 'utf8') + "";
        scriptTemplate = scriptTemplate.replace(/_AUTOUI/g, autoUIName);
        scriptTemplate = scriptTemplate.replace(/_MODULE/g, moduleName);
        scriptTemplate = scriptTemplate.replace(/_PREFABPATH/g, prefabPath);
        scriptTemplate = scriptTemplate.replace(/_UINAME/g, uiName);

        if (adb.exists(exportUIPath)) {
            Editor.warn(`文件${exportUIPath}已存在`);
        } else {
            adb.create(exportUIPath, scriptTemplate);
        }
    }
}