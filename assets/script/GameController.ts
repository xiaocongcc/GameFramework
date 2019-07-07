import { Network } from "./network/Network";
import { SingletonFactory } from "./utils/SingletonFactory";
import GameDataCenter from "./data/GameDataCenter";
import ProtoLoader from "./network/ProtoLoader";

class GameController {
    network: Network = null;

    constructor() {
    }

    init() {
        // 新建一个网络单例
        this.network = SingletonFactory.getInstance(Network);
        // 初始化数据模块
        GameDataCenter.initModule();
        // proto文件加载
        ProtoLoader.load();
    }
}

export default new GameController();