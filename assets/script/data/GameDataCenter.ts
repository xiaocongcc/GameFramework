import IDataModel from "./model/IDataModel";
import AccountModel from "./model/Account/AccountModel";
import SystemModel from "./model/System/SystemModel";
import { SingletonFactory } from "../utils/SingletonFactory";

class GameDataCenter {
    private _tModel: Array<IDataModel> = [];

    account: AccountModel = null;
    system: SystemModel = null;

    constructor() {

    }

    newModel<T extends IDataModel>(c: { new(): T }): T {
        let obj = SingletonFactory.getInstance(c);
        this._tModel.push(obj);
        return obj
    }

    clear() {
        this._tModel.forEach(m => {
            m.clear();
        });
    }

    initModule() {
        this.account = this.newModel(AccountModel);
    }
}

export default new GameDataCenter();