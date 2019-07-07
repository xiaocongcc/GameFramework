class CMessageRegister {
    tMsg = {};
    tClass = {};

    registerMsg(fileMsgObj) {
        for (let msgName in fileMsgObj) {
            this.tMsg[msgName] = fileMsgObj[msgName];
        }
    }

    getMsg(messageName) {
        if (this.tMsg.hasOwnProperty(messageName)) {
            return this.tMsg[messageName];
        }
        console.error('找不到消息名为' + messageName + '的消息');
        return null;
    }

    registerClass(protocolType, classType) {
        if (protocolType < 0) {
            return;
        }
        this.tClass[protocolType] = classType;
    }

    getClass(protocolType) {
        if (this.tClass.hasOwnProperty(protocolType)) {
            return this.tClass[protocolType];
        }
        console.error('找不到协议号' + protocolType + '对应的class');
        return null;
    }
}
export let MessageRegister = new CMessageRegister();



export class CMessageBase {
    public msgObj;
    public protocolType: number;
    public messageName: string;

    initMsgObj(databuff) {
        let MSG = MessageRegister.getMsg(this.messageName);
        if (!MSG) {
            console.error('MSG为空');
            return;
        }
        if (databuff) {
            this.msgObj = MSG.decode(databuff);
        } else {
            this.msgObj = new MSG();
        }
    }

    getType() {
        return this.protocolType;
    }

    getName() {
        return this.messageName;
    }

    toArrayBuffer(): ArrayBuffer {
        return this.msgObj.toArrayBuffer();
    }

    getMsg() {
        return this.msgObj;
    }
}