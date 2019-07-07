const fs = require('fs');
const path = require('fire-path');
const util = require('util');

const codeBodyFormat =
    `/**
 * 此文件为协议自动生成文件，不可手动编辑
 * 如协议有变动，只需执行【扩展/proto/create-message】即可
 */

// proto插件proto-processor.js 12行可以修改
import { CMessageBase, MessageRegister } from "./network/Message";

/**协议文件 */
export let ProtoFile = [
%s];

%s
`;

const fileListFormat =
    `   "%s",
`;

const classFormat =
    `   
/**%s */
export class %s extends CMessageBase {
    constructor (databuff = null) {
        super();
        this.protocolType = %d;
        this.messageName = '%s';
        this.initMsgObj(databuff);
    }%s
}
MessageRegister.registerClass(%d, %s);
`;

const accessFormat =
    `

    /**%s */
    set %s (param : %s) {
        this.msgObj.%s = param;
    }
    get %s () : %s {
        return this.msgObj.%s;
    }`;

// proto类型转换跟js类型的映射关系
const TYPE = {
    "int32": "number",
    "int64": "number",
    "string": "string",
    "bool": "boolean",
}

// proto关键字
const KEY_WORD = ['required', 'optional', 'repeated'];


/**去除所有空格 */
var trimAll = function (str) {
    return str.replace(/\s|\xA0/g, "");
}

var formatNum = function (str) {
    str = str.trim();
    return parseInt(str);
}

/**首字母大写 */
var firstCharUpper = function (str) {
    str = str.substring(0, 1).toUpperCase() + str.substring(1);
    return str;
}

module.exports = {
    outputData: {},

    /**
     * 传入文件列表，返回最终的数据
     * @param {*} fileDataList 
     */
    deal(fileDataList) {
        this.outputData = {};
        for (let i = 0; i < fileDataList.length; i++) {
            let data = fileDataList[i];
            if (!data.isUse) {
                continue;
            }
            let fileName = path.basenameNoExt(data.name);
            let str = fs.readFileSync(data.fullPath, 'utf-8').toString();
            this._dealProtoFile(fileName, str);
        }
        return this._formatOutput();
    },

    _dealProtoFile(fileName, str) {
        this.outputData[fileName] = {};

        let messageName;
        let bDealProperty = false;
        let tProperty = {};

        // 每个message之间用'}'分割
        let tMsg = str.trim().split('}');

        let self = this;

        tMsg.forEach(function (msg, mindex) {
            // 该段消息体如果没有 comment 或者 msgtype 标注，则不处理
            if (msg.indexOf('//@comment') == -1 && msg.indexOf('//@msgtype') == -1) {
                return;
            }
            msg.split('\n').forEach(function (v, index) {
                // 处理@comment
                if (v.indexOf('//@comment') != -1) {
                    let tCommentRet = self._dealComment(v);
                    let comment = tCommentRet[0];
                    let protocolType = tCommentRet[1];
                    messageName = tCommentRet[2];

                    if (messageName && !self.outputData[fileName].hasOwnProperty(messageName)) {
                        self.outputData[fileName][messageName] = {}
                    }
                    self.outputData[fileName][messageName] = {
                        "comment": comment,
                        "protocolType": protocolType,
                        "messageName": messageName,
                        "property": [],
                    }
                    return;
                }

                // 处理@msgtype
                if (v.indexOf('//@msgtype') != -1) {
                    let tCommentRet = self._dealMsgType(v);
                    let comment = tCommentRet[0];
                    messageName = tCommentRet[1];

                    if (messageName && !self.outputData[fileName].hasOwnProperty(messageName)) {
                        self.outputData[fileName][messageName] = {}
                    }
                    self.outputData[fileName][messageName] = {
                        "comment": comment,
                        "protocolType": -1,
                        "messageName": messageName,
                        "property": [],
                    }
                    return;
                }

                // 只在message和}之间才能解析属性
                if (!bDealProperty && v.indexOf('message') != -1) {
                    bDealProperty = true;
                    tProperty = {};
                    return;
                }
                if (bDealProperty && v.indexOf('}') != -1) {
                    bDealProperty = false;
                    return
                }
                if (!bDealProperty) {
                    return;
                }

                // 处理属性注释
                if (v.indexOf("//") != -1) {
                    let comment = v.trim().substring(2).trim();
                    tProperty["comment"] = comment;
                    return;
                }
                // 处理属性
                if (v.indexOf('=') != -1) {
                    let info = self._getProperty(v);
                    let type = info[0];
                    let name = info[1];
                    tProperty["type"] = type;
                    tProperty["name"] = name;
                    self.outputData[fileName][messageName]["property"].push(tProperty);
                    tProperty = {}
                    return;
                }
            });
        });
    },

    // 处理comment注释获得注释、协议号、消息名
    _dealComment(str) {
        str = trimAll(str);
        let pattern = /@comment\(\"(\S*)\",(\S*),\"(\S*)\"\)/;
        let values = str.match(pattern);

        let comment = values[1];
        let protocolType = formatNum(values[2]);
        let messageName = values[3];

        return [comment, protocolType, messageName];
    },

    // 处理property获得注释、消息名 
    _dealMsgType(str) {
        str = trimAll(str);
        let pattern = /@msgtype\(\"(\S*)\",\"(\S*)\"\)/;
        let values = str.match(pattern);

        let comment = values[1];
        let messageName = values[2];

        return [comment, messageName];
    },

    // 处理属性，格式：关键字(可选) 类型 名字 = 索引;
    _getProperty(str) {
        let t = str.trim().split(/\s+/);
        // 第一个为关键字，忽略
        if (KEY_WORD.indexOf(t[0]) != -1) {
            t.splice(0, 1);
        }
        let type = t[0];
        if (TYPE[type]) {
            type = TYPE[type];
        }
        let name = t[1];

        // map类型解析
        if (type.indexOf('map<') != -1) {
            let startIdx = type.indexOf('<');
            let endIdx = type.indexOf('>');
            type = type.substring(startIdx + 1, endIdx);
            let arr = type.split(',');
            type = 'map<';
            for (let i = 0; i < arr.length; i++) {
                if (TYPE[arr[i]]) {
                    type += TYPE[arr[i]];
                } else {
                    type += arr[i];
                }
                if (i != arr.length - 1) {
                    type += ',';
                }
            }
            type += '>';
            type = firstCharUpper(type);
        }

        // 如果是repeated则为数组类型
        if (str.indexOf("repeated") != -1) {
            type = util.format("Array<%s>", type);
        }

        return [type, name];
    },

    _formatOutput() {
        let exportFileStr = '';
        let exportClassStr = '';
        for (let fileName in this.outputData) {
            exportFileStr += util.format(fileListFormat, fileName);

            let fileInfo = this.outputData[fileName];
            for (let msgName in fileInfo) {
                let msgInfo = fileInfo[msgName];

                let accessStr = "";
                for (let idx in msgInfo.property) {
                    let info = msgInfo.property[idx];
                    accessStr += util.format(accessFormat, info.comment, info.name, info.type, info.name, info.name, info.type, info.name);
                }

                exportClassStr += util.format(classFormat, msgInfo.comment, msgInfo.messageName, msgInfo.protocolType, msgInfo.messageName, accessStr, msgInfo.protocolType, msgInfo.messageName);
            }
        }
        let outputStr = util.format(codeBodyFormat, exportFileStr, exportClassStr);
        return outputStr;
    }
}