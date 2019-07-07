import EventMng from "../../manager/EventMng";

export interface UIClass<T extends UIBase> {
    new(): T;
    getUrl(): string;
    getName(): string;
}

interface RegisterEvent {
    callback: Function,
    target?: any,
    playAudio?: boolean,
}

const PREFAB_UI_DIR = 'prefab/';

const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class UIBase extends cc.Component {
    protected static prefabUrl;
    protected static className;

    protected mTag: any;
    public get tag(): any {
        return this.mTag;
    }
    public set tag(value: any) {
        this.mTag = value;
    }

    /**
     * 得到prefab的路径，相对于resources目录
     */
    public static getUrl(): string {
        return PREFAB_UI_DIR + this.prefabUrl;
    }

    /**
     * 类名，用于给UI命名
     */
    public static getName(): string {
        return this.className;
    }

    /**通知事件列表 */
    private _notifyEventList: Map<string, Function>;
    /**点击事件列表 */
    private _registerEventList: Map<string, RegisterEvent>;

    /* ----------------------------- 以下方法不能在子类重写 ----------------------------- */
    /**初始化函数，在onLoad之前被调用，params为打开ui是传入的不定参数数组 */
    init(params) {
        this.onInit(params);
    }

    /**onLoad 会在组件被首次加载的时候被回调。且优先于任何start */
    onLoad() {
        this._notifyEventList = new Map<string, Function>();
        this._registerEventList = new Map<string, RegisterEvent>();

        this.onUILoad();
    }

    onDestroy() {
        this.onUIDestroy();
    }

    onEnable() {
        this.onRegisterEvent(this.node, this.touchEvent, this, false);

        this.onShow();
    }

    onDisable() {
        this.unRegisterEvent(this.node, this.touchEvent, this);

        this.onHide();

        let self = this;
        this._notifyEventList.forEach((f, key) => {
            EventMng.off(key, f, self);
        }, this);
        this._notifyEventList.clear();
    }

    /**注册notice事件，disable的时候会自动移除 */
    initEvent(eventName: string, cb: Function) {
        EventMng.on(eventName, cb, this);
        this._notifyEventList.set(eventName, cb);
    }

    private touchEvent(event) {
        event.stopPropagation();
    }

    start() {
        this.onStart();
    }

    update(dt) {
        this.onUpdate(dt);
    }
    /* ---------------------------------------------------------------------------------- */


    onInit(params) {

    }

    onUILoad() {

    }

    onUIDestroy() {

    }

    onShow() {

    }

    onHide() {

    }

    onStart() {

    }

    onUpdate(dt) {

    }

    onClose() {

    }


    /**
     * 注册touch事件
     * @param node 
     * @param callback 
     * @param target 
     * @param playAudio 是否播放音效，默认播放
     */
    onRegisterEvent(node: cc.Node, callback, target = null, playAudio = true) {
        if (!node) {
            return;
        }
        node.on(cc.Node.EventType.TOUCH_END, callback, target);

        this._registerEventList.set(node.name, { callback: callback, target: target, playAudio: playAudio });
    }

    unRegisterEvent(node: cc.Node, callback, target = null) {
        node.off(cc.Node.EventType.TOUCH_END, callback, target);
    }
}