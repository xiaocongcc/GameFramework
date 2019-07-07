const { ccclass } = cc._decorator;

@ccclass
export default class auto_notice extends cc.Component {
	notice: cc.Node;
	background: cc.Node;
	title: cc.Node;
	content: cc.Node;
	btnClose: cc.Node;

	public static URL:string = "db://assets/resources/prefab/notice/notice.prefab"

    onLoad () {
		this.notice = this.node
		this.background = this.notice.getChildByName("background");
		this.title = this.notice.getChildByName("title");
		this.content = this.notice.getChildByName("content");
		this.btnClose = this.notice.getChildByName("btnClose");

    }
}
