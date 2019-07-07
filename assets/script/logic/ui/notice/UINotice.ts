import auto_notice from "../../../Data/AutoUI/notice/auto_notice";
import UIBase from "../UIBase";
import UIHelp from "../UIHelp";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/notice/UINotice")
export default class UINotice extends UIBase {
	ui: auto_notice = null;

	protected static prefabUrl = "notice/notice";
	protected static className = "UINotice";

	onUILoad() {
		this.ui = this.node.addComponent(auto_notice);
	}

	onShow() {
		this.onRegisterEvent(this.ui.btnClose, this.onClose, this);
	}

	onHide() {
		this.unRegisterEvent(this.ui.btnClose, this.onClose, this);
	}

	onStart() {
		UIHelp.SetLabel(this.ui.title, '测试公告标题');
		UIHelp.SetLabel(this.ui.content, '测试公告内容');
	}

	onClose() {
		UIHelp.CloseUI(UINotice);
	}
}