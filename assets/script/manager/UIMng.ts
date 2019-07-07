import UIBase, { UIClass } from "../logic/ui/UIBase";
import { ViewZorder } from "../data/const/ViewZOrder";

export default class UIMng {
    private static instance: UIMng;

    private uiList: UIBase[] = [];

    public static getInstance(): UIMng {
        if (this.instance == null) {
            this.instance = new UIMng();
        }
        return this.instance;
    }

    private constructor() {

    }

    /**
     * 打开UI
     * @param uiClass 
     * @param zOrder 
     * @param callback 打开完毕回调函数
     * @param onProgress 打开过程进度函数
     * @param args 传入到UI的参数
     */
    public openUI<T extends UIBase>(uiClass: UIClass<T>, zOrder: number = ViewZorder.UI, callback?: Function, onProgress?: Function, ...args: any[]) {
        if (this.getUI(uiClass)) {
            console.error(`UIMng OpenUI 1: ui ${uiClass.getName()} is already exist, please check`);
            return;
        }
        cc.loader.loadRes(uiClass.getUrl(), (completedCount: number, totalCount: number, item: any) => {
            onProgress && onProgress(completedCount, totalCount, item);
        }, (error, prefab) => {
            if (error) {
                console.error(`UIMng OpenUI: load ui error: ${error}`);
                return;
            }
            if (this.getUI(uiClass)) {
                console.error(`UIMng OpenUI 2: ui ${uiClass.getName()} is already exist, please check`);
                return;
            }

            let uiNode: cc.Node = cc.instantiate(prefab);
            let ui = uiNode.getComponent(uiClass) as UIBase;
            if (!ui) {
                console.error(`${uiClass.getUrl()}没有绑定UI脚本!!!`);
                return;
            }
            ui.init(args);
            // let uiRoot = cc.director.getScene().getChildByName('UIRoot');
            let uiRoot = cc.director.getScene();
            if (!uiRoot) {
                console.error(`当前场景${cc.director.getScene().name}Canvas!!!`);
                return;
            }
            uiNode.parent = uiRoot;
            uiNode.zIndex = zOrder;
            this.uiList.push(ui);
            ui.tag = uiClass;

            callback && callback(ui);
        });
    }


    /**
     * 清除依赖资源
     * @param prefabUrl 
     */
    private clearDependsRes(prefabUrl) {
        let deps = cc.loader.getDependsRecursively(prefabUrl);
        // console.log(`UIMng clearDependsRes: release ${prefabUrl} depends resources `, deps);
        deps.forEach((item) => {
            // todo：排除公共资源，然后清理
            // if (item.indexOf('common') === -1) {
            //     cc.loader.release(item);
            // }
        });
    }

    public closeUI<T extends UIBase>(uiClass: UIClass<T>) {
        for (let i = 0; i < this.uiList.length; ++i) {
            if (this.uiList[i].tag === uiClass) {
                if (cc.isValid(this.uiList[i].node)) {
                    this.uiList[i].node.destroy();
                    this.clearDependsRes(uiClass.getUrl());
                }
                this.uiList.splice(i, 1);
                return;
            }
        }
    }

    public closeAllUI() {
        if (this.uiList.length == 0) {
            return;
        }
        this.closeUI(this.uiList[0].tag);
        while (this.uiList.length > 0) {
            this.closeUI(this.uiList[0].tag);
        }
    }

    public showUI<T extends UIBase>(uiClass: UIClass<T>, callback?: Function) {
        let ui = this.getUI(uiClass);
        if (!ui) {
            console.error(`UIMng showUI: ui ${uiClass.getName()} not exist`);
            return;
        }
        ui.node.active = true;
    }

    public hideUI<T extends UIBase>(uiClass: UIClass<T>) {
        let ui = this.getUI(uiClass);
        if (ui) {
            ui.node.active = false;
        }
    }

    public getUI<T extends UIBase>(uiClass: UIClass<T>): UIBase {
        for (let i = 0; i < this.uiList.length; ++i) {
            if (this.uiList[i].tag === uiClass) {
                return this.uiList[i];
            }
        }
        return null;
    }

    public isShowing<T extends UIBase>(uiClass: UIClass<T>) {
        let ui = this.getUI(uiClass);
        if (!ui) {
            return false;
        }
        return ui.node.active;
    }
}