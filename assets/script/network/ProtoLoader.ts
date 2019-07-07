import ProtoBuf from "./ProtoBuf";
import { MessageRegister } from "./Message";
import { ProtoFile } from "../ProtoMessage";

const PROTO_PATH = 'proto/';
const BASE_FILE = 'base';

class ProtoLoader {
    private protoBuf: ProtoBuf = null;
    private loadedFileCount = 0;
    private _finishCb: Function;

    constructor() {
        this.protoBuf = new ProtoBuf();
    }

    load(finishCb?: Function) {
        this._finishCb = finishCb;
        this.registerBaseFile();
    }

    /**
     * 先注册base文件
     * base文件：将公用的放到这里，加载其他proto之前需要先加载完此文件
     */
    private registerBaseFile() {
        let basePath = PROTO_PATH + BASE_FILE;
        this.protoBuf.loadFile(basePath, (builder, error) => {
            this.registerMsg([builder]);
            this.registerAllProtoFile();
        });
    }

    private registerAllProtoFile() {
        this.loadedFileCount = 0;
        let builders = [];
        for (let i = 0; i < ProtoFile.length; i++) {
            if (ProtoFile[i] == BASE_FILE) {
                this.loadedFileCount++;
                continue;
            }
            let path = PROTO_PATH + ProtoFile[i];
            this.protoBuf.loadFile(path, (builder, error) => {
                builder && builders.push(builder);
                this.loadedFileCount++;
                if (this.loadedFileCount >= ProtoFile.length) {
                    this.registerMsg(builders);
                    this._finishCb && this._finishCb();
                }
            });
        }
    }

    /**注册（缓存）所有的message对象到MessageRegister中 */
    private registerMsg(builders) {
        builders.forEach((b) => {
            let pbObj = b.build('');
            MessageRegister.registerMsg(pbObj);
        });
    }
}

export default new ProtoLoader();