import auto_main from "../../../Data/AutoUI/scene/auto_main";
import UIBase from "../UIBase";
import UIHelp from "../UIHelp";
import UINotice from "../notice/UINotice";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/scene/UIMain")
export default class UIMain extends UIBase {
	ui: auto_main = null;

	protected static prefabUrl = "db://a";
	protected static className = "UIMain";

	onUILoad() {
		this.ui = this.node.addComponent(auto_main);
	}

	onShow() {
		this.onRegisterEvent(this.ui.btn_notice, this.onOpenNotice, this);
	}

	onHide() {
		this.unRegisterEvent(this.ui.btn_notice, this.onOpenNotice, this);
	}

	onStart() {

	}

	onOpenNotice() {
		UIHelp.ShowUI(UINotice);
	}

}