const { ccclass } = cc._decorator;

@ccclass
export default class auto_confirmDialog extends cc.Component {
	confirmDialog: cc.Node;
	background: cc.Node;
	lbl_title: cc.Node;
	lbl_content: cc.Node;
	btn_cancel: cc.Node;
	Background: cc.Node;
	Label: cc.Node;
	btn_certain: cc.Node;

	public static URL:string = "db://assets/resources/prefab/tips/confirmDialog.prefab"

    onLoad () {
		this.confirmDialog = this.node
		this.background = this.confirmDialog.getChildByName("background");
		this.lbl_title = this.confirmDialog.getChildByName("lbl_title");
		this.lbl_content = this.confirmDialog.getChildByName("lbl_content");
		this.btn_cancel = this.confirmDialog.getChildByName("btn_cancel");
		this.Background = this.btn_cancel.getChildByName("Background");
		this.Label = this.Background.getChildByName("Label");
		this.btn_certain = this.confirmDialog.getChildByName("btn_certain");

    }
}
