# UI模块

## 目录结构

- `UIMng`：UI管理器，用于打开、关闭UI

- `UIBase`：UI界面基类，在这里可以定义一些通用方法，供子类调用或者继承

- `UIHelp`：UI工具类，封装一系列UI相关的功能方法

---  

## 如何使用（配合自动化插件）

1.新建一个场景或者prefab

2.选中，然后到工具栏:扩展->ui-creator

`create-node-tree操作`是将节点树的结构自动导出到ts文件

```typescript
let parent = this.node.getParent();
this.Canvas = parent.getChildByName("Canvas");
this.background = this.Canvas.getChildByName("background");
this.btnNotice = this.Canvas.getChildByName("btnNotice");
```

`create-ui-template操作`是自动生成UI模板ts文件

以后，你想要使用ui节点，就不需要各种getChildByName，或者搞个property，所有的节点都导出在一个ts文件，然后作为一个组件添加到UI文件中，你只需要this.ui[节点名称]即可访问。

3.将第2步生成的UI脚本文件，在编辑器拖到prefab的根节点作为组件

4.UI的基本操作都封装在UIHelp中

```typescript
UIHelp.ShowUI(UINotice);    // 打开ui
UIHelp.CloseUI(UINotice);   // 关闭ui
UIHelp.SetLabel(this.ui.title, '测试公告标题'); // 修改label节点文本
```

---  

## todo

1.后续补充关闭UI清除相关无用资源