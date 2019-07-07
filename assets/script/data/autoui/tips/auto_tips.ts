const { ccclass } = cc._decorator;

@ccclass
export default class auto_tips extends cc.Component {
	tips: cc.Node;

	public static URL:string = "db://assets/resources/prefab/tips/tips.prefab"

    onLoad () {
		this.tips = this.node

    }
}
