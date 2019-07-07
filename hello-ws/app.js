// 导入WebSocket模块:
const WebSocket = require('ws');
const protobufjs = require('protobufjs');
var root = protobufjs.loadSync('./login.proto');

// 引用Server类:
const WebSocketServer = WebSocket.Server;

// 实例化，并监听3000端口:
const wss = new WebSocketServer({
    port: 3000
});

wss.on('connection', function (ws) {
    console.log(`[SERVER] connection()`);
    ws.binaryType = 'arraybuffer';
    ws.on('message', function (data) {
        // console.log(`[SERVER] Received: ${message}`);
        // ws.send(message);

        // 协议格式：总字节数（4个字节，总字节数=协议号字节数+数据长度） + 协议号（4个字节） + 数据
        let protocolType = data.readInt32BE(4); // 4开始后面4个字节（32位）是协议号
        let bytes = data.slice(8, data.byteLength); // 8开始都是数据
        let C2G_Login = root.lookupType('C2G_Login');
        let loginRes = C2G_Login.decode(bytes);
        console.log(loginRes.cmd, loginRes.name, loginRes.pw);

        if (protocolType == 10000) {
            let G2C_Login = root.lookupType('G2C_Login');
            let loginReq = G2C_Login.create();
            loginReq.msg = `hello, ${loginRes.name}`;
            let sendData = G2C_Login.encode(loginReq).finish();
            let sendBuffer = Buffer.alloc(8);
            sendBuffer.writeInt32BE(sendData.byteLength + 4);
            sendBuffer.writeInt32BE(10001, 4);
            let totalBuffer = Buffer.concat([sendBuffer, sendData], sendData.length + sendBuffer.length)
            ws.send(totalBuffer);
        }
    })
});