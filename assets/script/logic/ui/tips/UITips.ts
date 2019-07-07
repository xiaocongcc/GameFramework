import { TipsItem } from "./TipsItem";
import UIBase from "../UIBase";

const { ccclass, menu, property } = cc._decorator;

@ccclass
@menu('UI/Common/UITips')
export default class UITips extends UIBase {
    protected static prefabUrl = "tips/tips";
    protected static className = "UITips";

    @property(cc.Prefab)
    private tipPrefab: cc.Prefab = null;

    private tipPool: TipsItem[] = [];

    showTip(message: string) {
        for (let i = 0; i < this.tipPool.length; ++i) {
            if (this.tipPool[i] != null && this.tipPool[i].isReady()) {
                this.tipPool[i].playTip(message);
                return;
            }
        }
        let TipNode = cc.instantiate(this.tipPrefab);
        TipNode.parent = this.node;
        let tip = TipNode.getComponent(TipsItem);
        this.tipPool.push(tip);
        tip.playTip(message);
    }

    onClose() {

    }
}