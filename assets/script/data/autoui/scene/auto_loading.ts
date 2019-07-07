const { ccclass } = cc._decorator;

@ccclass
export default class auto_loading extends cc.Component {
	Canvas: cc.Node;
	background: cc.Node;
	lbl_title: cc.Node;
	loginNode: cc.Node;
	lbl_account: cc.Node;
	edit_account: cc.Node;
	BACKGROUND_SPRITE: cc.Node;
	TEXT_LABEL: cc.Node;
	PLACEHOLDER_LABEL: cc.Node;
	lbl_password: cc.Node;
	edit_password: cc.Node;
	btn_login: cc.Node;
	lbl_login: cc.Node;

	public static URL:string = "db://assets/scene/loading.fire"

    onLoad () {
		let parent = this.node.getParent();
		this.Canvas = parent.getChildByName("Canvas");
		this.background = this.Canvas.getChildByName("background");
		this.lbl_title = this.Canvas.getChildByName("lbl_title");
		this.loginNode = this.Canvas.getChildByName("loginNode");
		this.lbl_account = this.loginNode.getChildByName("lbl_account");
		this.edit_account = this.lbl_account.getChildByName("edit_account");
		this.BACKGROUND_SPRITE = this.edit_account.getChildByName("BACKGROUND_SPRITE");
		this.TEXT_LABEL = this.edit_account.getChildByName("TEXT_LABEL");
		this.PLACEHOLDER_LABEL = this.edit_account.getChildByName("PLACEHOLDER_LABEL");
		this.lbl_password = this.loginNode.getChildByName("lbl_password");
		this.edit_password = this.lbl_password.getChildByName("edit_password");
		this.btn_login = this.loginNode.getChildByName("btn_login");
		this.lbl_login = this.btn_login.getChildByName("lbl_login");

    }
}
