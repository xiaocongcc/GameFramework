import { SocketEvent } from "../data/const/EventConst";
import { MessageRegister } from "./Message";
import EventMng from "../manager/EventMng";
import { ISocket, SocketState, WbSocket, WxSocket } from "./Socket";
import { Log, LOG_TAG } from "../utils/Log";
import UIHelp from "../logic/ui/UIHelp";
import GameController from "../GameController";

const DATA_TOTAL_LEN = 4;	//数据总长度
const PROTOCOLTYPE_LEN = 4;	//协议号长度

export interface ISocketDelegate {
    onSocketOpen();
    onSocketMessage(data: string | ArrayBuffer);
    onSocketError(errMsg);
    onSocketClosed(msg: string);
}

/**
 * 实现socket各个回调接口
 */
export class SocketDelegate implements ISocketDelegate {
    private _socket: ISocket;

    isSocketOpened() {
        return (this._socket && this._socket.getState() == SocketState.OPEN);
    }

    isSocketClosed() {
        return this._socket == null;
    }

    connect(url: string) {
        Log.log(LOG_TAG.SOCKET, 'connect socket = ' + url);
        // 根据平台创建socket
        if (cc.sys.platform === cc.sys.WECHAT_GAME) {
            this._socket = new WxSocket(url, this);
        } else {
            this._socket = new WbSocket(url, this);
        }
        this._socket.connect();
    }

    closeConnect() {
        if (this._socket) {
            this._socket.close();
        }
    }

    onSocketOpen() {
        Log.log(LOG_TAG.SOCKET, 'socket open');
        EventMng.emit(SocketEvent.SOCKET_OPEN);
    }

    onSocketError(errMsg) {
        errMsg && Log.error('socket error, msg = ' + errMsg);
        // 具体网络错误或失败的原因很多种很复杂，这里只是demo，简单处理，失败了就继续connect
        UIHelp.ShowDialog({
            title: '联网失败', content: '是否重新连接？（请确认服务器是否开启）',
            certainCb: () => {
                GameController.network.connect();
            }
        })
    }

    onSocketClosed(msg: string) {
        Log.log(LOG_TAG.SOCKET, 'socket close, reason = ' + msg);
        if (this._socket) {
            this._socket.close();
        }
        this._socket = null;
        EventMng.emit(SocketEvent.SOCKET_CLOSE);
    }

    onSocketMessage(data: string | ArrayBuffer) {
        if (this.isSocketClosed()) {
            Log.error('onMessage call but socket had closed')
            return;
        }
        let msg;
        if (typeof (data) === 'string') {
            msg = data;
        } else {
            msg = this.bufferToMsg(data);
        }
        // Log.log(LOG_TAG.SOCKET, 'recieve msg = ', msg);
        EventMng.emit(msg.messageName, msg);
    }

    send(msg) {
        if (typeof (msg) === 'string') {
            this._socket.send(msg);
        } else {
            let sendBuf = this.msgToBuffer(msg);
            this._socket.send(sendBuf);
        }
    }

    /**
     * buffer转msg，解包用
     * 协议格式：总字节数（4个字节，总字节数=协议号字节数+数据长度） + 协议号（4个字节） + 数据
     * @param recvBuf 
     */
    private bufferToMsg(recvBuf: ArrayBuffer) {
        let recvView = new DataView(recvBuf);
        let protocolType = recvView.getInt32(DATA_TOTAL_LEN);
        let msgBuf = recvBuf.slice(DATA_TOTAL_LEN + PROTOCOLTYPE_LEN, recvBuf.byteLength);
        let classType = MessageRegister.getClass(protocolType);
        let msg = new classType(msgBuf);
        return msg;
    }

    /**
     * msg转buffer，封包用
     * 协议格式：总字节数（4个字节，总字节数=协议号字节数+数据长度） + 协议号（4个字节） + 数据
     * @param msg 
     */
    private msgToBuffer(msg) {
        let protocolType = msg.protocolType;
        let dataBuf = msg.toArrayBuffer();
        let dataView = new DataView(dataBuf);
        let dataLen = dataBuf.byteLength

        let sendBuf = new ArrayBuffer(DATA_TOTAL_LEN + PROTOCOLTYPE_LEN + dataLen);
        let sendView = new DataView(sendBuf);
        sendView.setInt32(0, PROTOCOLTYPE_LEN + dataLen);
        sendView.setInt32(DATA_TOTAL_LEN, protocolType);
        for (let i = 0; i < dataLen; i++) {
            sendView.setInt8(PROTOCOLTYPE_LEN + DATA_TOTAL_LEN + i, dataView.getInt8(i));
        }

        return sendBuf;
    }
}