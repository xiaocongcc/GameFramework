import { G2C_Login, C2G_Login } from "../../../ProtoMessage";
import IDataModel from "../IDataModel";
import UIHelp from "../../../logic/ui/UIHelp";
import EventMng from "../../../manager/EventMng";
import { GameEvent } from "../../const/EventConst";

const KEY_ACCOUNT = 'account';

export default class AccountModel extends IDataModel {
    constructor() {
        super('account');
    }

    /**缓存账号到本地 */
    saveAccount(account: string) {
        this.Set(KEY_ACCOUNT, account);
        this.Save();
    }

    /**从本地读取缓存账号 */
    getAccount() {
        return this.Query(KEY_ACCOUNT, '');
    }

    /**需要重写 */
    getMessageListeners() {
        return {
            // key为消息名，value为触发函数
            ['G2C_Login']: (msg) => { this.G2C_LoginSuccess(msg) },
        }
    }

    /**请求登录 */
    Login(account: string, password: string) {
        let login = new C2G_Login();
        login.cmd = 'login';
        login.name = account;
        login.pw = password;
        this.sendProtocolMsg(login);

        this.saveAccount(account);
    }

    /**登录成功 */
    G2C_LoginSuccess(msg: G2C_Login) {
        UIHelp.ShowTips('登录成功！' + msg.msg);
        EventMng.emit(GameEvent.LOGIN_SUCCESS);
    }
}