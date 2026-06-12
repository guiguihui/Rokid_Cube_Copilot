# 03 · 智能体框架（机制）

源：`docs/aiui/0-guide/framework/*`

> 框架分**逻辑层 + 视图层**。

---

## intro — 框架组成

四个组成部分：
1. **逻辑层(Logic Layer)**：跑在 **QuickJS**，处理业务逻辑、API 调用、数据状态。
2. **视图层(View Layer)**：WXML + WXSS，跑在 **Ink 渲染引擎**，负责结构与样式。
3. **应用入口**：`app.json` 定义页面入口 + 全局窗口配置，决定启动先进哪个页面。
4. **智能体描述**：`AGENTS.md` 定义身份/描述/能力/系统指令，决定平台如何理解调度该 agent。

设计目标：拆开"智能体是谁/入口在哪/逻辑怎么流转/界面如何反馈"，适配 AI+AR 高频交互与持续状态更新。

---

## category — 两类形态

| | 对话式 AIUI | 沉浸式 AIUI |
|---|---|---|
| 交互承载 | UI 嵌在聊天流(卡片/表单/结果块) | 独立界面是主舞台 |
| 上下文 | 共享当前会话上下文 | 独立运行上下文，长时驻留 |
| 开发重点 | 设计页面描述/参数/卡片交互，让模型知道何时返回 UI | 自己组织界面状态/事件循环，接 SSE/WebSocket/fetch 建完整链路 |
| 体验目标 | 快速反馈、低打断、一步到位 | 持续协作、状态稳定、操作空间完整 |
| 场景 | 天气/搜索结果/行程确认/待办表单 | 回合制游戏/工作流面板/设备控制/长时任务 |

真实产品常两者并用。

---

## logic — 逻辑开发（类似现代前端，用 `export default` 注册）

### 注册 App（根目录 `app.js` 或 SFC 的 `app.ink`）
```javascript
// app.js
export default {
  onLaunch(options){},   // 初始化（全局只一次）
  onShow(options){},     // 启动 / 后台→前台
  onHide(){},            // 前台→后台
  globalData:{ userInfo:null }
}
```
App 生命周期：`onLaunch` / `onShow` / `onHide` / `onError`(脚本错误或 API 失败)。
⚠️ `.ink` 作为 SFC 入口本身不支持模块导出，只能在脚本块定义逻辑 + import 其他 ESM。

### 注册 Page（`.js` 用 export default / `.ink` 在 `<script setup>`）
```javascript
// pages/index/index.js
export default {
  data:{ title:'Hello AIUI', count:0 },
  onLoad(query){}, onShow(){}, onReady(){}, onHide(){}, onUnload(){},
  handleIncrement(){ this.setData({ count:this.data.count+1 }); }
}
```
Page 生命周期：`onLoad(query)`(加载,只一次) / `onShow` / `onReady`(初次渲染完成,只一次) / `onHide` / `onUnload`。

### 页面实例方法（`this`）
- `this.setData(data, callback?)`：逻辑层→视图层（**异步**，差量更新），同时改 `this.data`。
- `this.data`：读当前数据。
- ⚠️ `this.route`：**暂不支持**。

---

## ui — UI 开发（WXML + WXSS）

### WXML（类 HTML 标记）
- 数据绑定：Mustache `{{ }}`
- 列表：`ink:for="{{items}}"` + `item`/`index`，配 `ink:key="id"`
- 条件：`ink:if` / `ink:elif` / `ink:else`
- 事件：`bindtap` 等
```html
<view class="item" ink:for="{{items}}" ink:key="id" bindtap="handleItemClick">
  <text>{{index + 1}}. {{item.name}}</text>
  <text ink:if="{{item.status === 'active'}}" class="badge">进行中</text>
</view>
```

### WXSS（扩展 CSS）
- **`rpx`**(responsive pixel) 自适应单位；⚠️ **规定屏幕宽 `480rpx`**。
- `@import` 导入外联样式；支持 `style`/`class`；常用选择器(`.class`/`#id`/element/`::after`/`::before`)。

### 渲染流程
- `this.setData` → 视图层差量更新。
- 视图层运行在 **JSAR 渲染引擎**，2D/3D 混合渲染，适配 AI+AR。
  （注：intro 里称 Ink 渲染引擎，ui 里称 JSAR —— 二者关联，Ink 为 agent 运行时/渲染体系。）
