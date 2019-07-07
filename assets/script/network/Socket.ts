import { ISocketDelegate } from "./SocketDelegate";
import { Log } from "../utils/Log";

export enum SocketState {
    CONNECTING = 1,
    OPEN,
    CLOSING,
    CLOSED
};

export interface ISocket {
    connect();
    send(data: string | ArrayBuffer);
    close();
    getState();
}

/**
 * WebSocket的具体实现
 */
export class WbSocket implements ISocket {
    private _url: string;
    private _delegate: ISocketDelegate;
    private _webSocket: WebSocket;

    constructor(url: string, delegate: ISocketDelegate) {
        this._url = url;
        this._delegate = delegate;
    }

    connect() {
        let ws = this._webSocket = new WebSocket(this._url);
        ws.binaryType = 'arraybuffer';  // 默认为blob，这里要改为arraybuffer
        ws.onopen = (event) => {
            this._delegate.onSocketOpen();
        };
        ws.onmessage = (event) => {
            this._delegate.onSocketMessage(event.data);
        };
        ws.onerror = (event) => {
            this._delegate.onSocketError(null);
        };
        ws.onclose = (event) => {
            this._delegate.onSocketClosed(event.reason);
        }
    }

    /**
     * 
     * @param data {string | ArrayBuffer}
     */
    send(data: string | ArrayBuffer) {
        this._webSocket.send(data);
    }

    close() {
        if (!this._webSocket) {
            return;
        }
        try {
            this._webSocket.close();
        } catch (err) {
            Log.error('error while closing webSocket ', err.toString());
        }
        this._webSocket = null;
    }

    getState() {
        if (this._webSocket) {
            switch (this._webSocket.readyState) {
                case WebSocket.OPEN:
                    return SocketState.OPEN;
                case WebSocket.CONNECTING:
                    return SocketState.CONNECTING;
                case WebSocket.CLOSING:
                    return SocketState.CLOSING;
                case WebSocket.CLOSED:
                    return SocketState.CLOSED;
            }
        }
        return SocketState.CLOSED;
    }
}

/**
 * wx socket的具体实现
 */
export class WxSocket implements ISocket {
    private _url: string;
    private _delegate: ISocketDelegate;
    private _socketTask: wx.SocketTask;
    private _state: SocketState = SocketState.CLOSED;

    constructor(url: string, delegate: ISocketDelegate) {
        this._url = url;
        this._delegate = delegate;
    }

    connect() {
        this._state = SocketState.CONNECTING;

        let ws = this._socketTask = wx.connectSocket({
            url: this._url,
        });
        ws.onOpen = (res) => {
            this._state = SocketState.OPEN;
            this._delegate.onSocketOpen();
        }
        ws.onMessage = (res) => {
            this._delegate.onSocketMessage(res.data);
        };
        ws.onError = (res) => {
            this._delegate.onSocketError(res.errMsg);
        };
        ws.onClose = (res) => {
            this._state = SocketState.CLOSED;
            this._delegate.onSocketClosed(res);
        }
    }

    /**
     * wx socket send 只接受string/ArrayBuffer
     * @param data {string/ArrayBuffer}
     */
    send(data: string | ArrayBuffer) {
        this._socketTask.send({
            data: data
        });
    }

    close() {
        if (!this._socketTask) {
            return;
        }
        this._state = SocketState.CLOSING;
        try {
            this._socketTask.close();
        } catch (err) {
            Log.error('error while closing webSocket ', err);
        }
        this._socketTask = null;
    }

    getState() {
        return this._state;
    }
}