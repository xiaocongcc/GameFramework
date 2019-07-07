const { ccclass } = cc._decorator;

@ccclass
export default class auto_tipsItem extends cc.Component {
	tipsItem: cc.Node;
	TipsBg: cc.Node;
	Label: cc.Node;

	public static URL:string = "db://assets/resources/prefab/tips/tipsItem.prefab"

    onLoad () {
		this.tipsItem = this.node
		this.TipsBg = this.tipsItem.getChildByName("TipsBg");
		this.Label = this.TipsBg.getChildByName("Label");

    }
}
