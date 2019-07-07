import { SocketDelegate } from "./SocketDelegate";
import { Log } from "../utils/Log";

export class Network {
    private _socket: SocketDelegate = null;
    private _url: string = 'ws://localhost:3000';

    constructor() {
        // this.safeConnectSocket();
    }

    close() {
        this.safeCloseSocket();
    }

    send(msg) {
        if (!this._socket.isSocketOpened()) {
            Log.error('send message but socket not open!')
            return;
        }
        this._socket.send(msg);
    }

    connect() {
        this.safeConnectSocket();
    }

    private safeConnectSocket() {
        if (this._socket != null) {
            this._socket.closeConnect();
        }
        this._socket = new SocketDelegate();
        this._socket.connect(this._url);
    }

    private safeCloseSocket() {
        if (this._socket != null) {
            this._socket.closeConnect();
        }
        this._socket = null;
    }
}