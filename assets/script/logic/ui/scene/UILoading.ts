import auto_loading from "../../../Data/AutoUI/scene/auto_loading";
import UIBase from "../UIBase";
import UIHelp from "../UIHelp";
import GameController from "../../../GameController";
import EventMng from "../../../manager/EventMng";
import { SocketEvent, GameEvent } from "../../../data/const/EventConst";
import GameDataCenter from "../../../data/GameDataCenter";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/scene/UILoading")
export default class UILoading extends UIBase {
	ui: auto_loading = null;

	protected static prefabUrl = "db://a";
	protected static className = "UILoading";

	onUILoad() {
		this.ui = this.node.addComponent(auto_loading);

		this.ui.loginNode.active = false;
	}

	onShow() {
		// 监听btn_login点击事件
		this.onRegisterEvent(this.ui.btn_login, this.onLogin, this);

		// 监听事件
		EventMng.on(SocketEvent.SOCKET_OPEN, this.onSocketOpen, this);
		EventMng.on(GameEvent.LOGIN_SUCCESS, this.onLoginSuccess, this);
	}

	onHide() {
		// 取消监听btn_login点击事件
		this.unRegisterEvent(this.ui.btn_login, this.onLogin, this);

		// 取消监听事件
		EventMng.off(SocketEvent.SOCKET_OPEN, this.onSocketOpen, this);
		EventMng.off(GameEvent.LOGIN_SUCCESS, this.onLoginSuccess, this);
	}

	onStart() {
		// 游戏初始化
		GameController.init();
		// 连接网络
		GameController.network.connect();
	}

	onSocketOpen() {
		this.ui.loginNode.active = true;
		// 读取缓存账号
		let account = GameDataCenter.account.getAccount();
		if (account != '') {
			this.ui.edit_account.getComponent(cc.EditBox).string = account;
		}
	}

	onLogin() {
		let account = this.ui.edit_account.getComponent(cc.EditBox).string;
		let password = this.ui.edit_password.getComponent(cc.EditBox).string;
		GameDataCenter.account.Login(account, password);
	}

	onLoginSuccess() {
		// 登录成功，切换到主界面
		cc.director.loadScene('main');
	}
}