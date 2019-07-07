import auto_confirmDialog from "../../../Data/AutoUI/tips/auto_confirmDialog";
import UIBase from "../UIBase";
import UIHelp, { DialogParams } from "../UIHelp";
import { Log } from "../../../utils/Log";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu("UI/tips/UIConfirmDialog")
export default class UIConfirmDialog extends UIBase {
	ui: auto_confirmDialog = null;

	protected static prefabUrl = "tips/confirmDialog";
	protected static className = "UIConfirmDialog";

	private _title: string;
	private _content: string;
	private _certainCb: Function;
	private _cancelCb: Function;

	onInit(params) {
		if (params == undefined) {
			Log.error(`UIConfirmDialog:没有传入参数！！！`);
			return;
		}
		let data = params[0] as DialogParams;
		this._title = data.title;
		this._content = data.content;
		this._certainCb = data.certainCb;
		this._cancelCb = data.cancelCb;
	}

	onUILoad() {
		this.ui = this.node.addComponent(auto_confirmDialog);
	}

	onShow() {
		this.onRegisterEvent(this.ui.btn_cancel, this.onCancel, this);
		this.onRegisterEvent(this.ui.btn_certain, this.onCertain, this);
	}

	onHide() {
		this.unRegisterEvent(this.ui.btn_cancel, this.onCancel, this);
		this.unRegisterEvent(this.ui.btn_certain, this.onCertain, this);
	}

	onStart() {
		UIHelp.SetLabel(this.ui.lbl_title, this._title);
		UIHelp.SetLabel(this.ui.lbl_content, this._content);
	}

	onClose() {
		UIHelp.CloseUI(UIConfirmDialog);
	}

	onCancel() {
		this._cancelCb && this._cancelCb();
		this.onClose();
	}

	onCertain() {
		this._certainCb && this._certainCb();
		this.onClose();
	}
}