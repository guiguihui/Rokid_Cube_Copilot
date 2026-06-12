# 09 · Open Agent Format (OAF)

源：`docs/aiui/0-guide/open-agent-format/*`

> OAF = 用目录/文件描述智能体的开放规范。**OAF 负责描述智能体；AIUI 在其上补"应用层 + 界面层"**，让智能体可运行可交互。

智能体三类关键内容：`AGENTS.md`(是谁/做什么/指令) + `app.json`(应用入口/全局配置) + `pages/`(页面与交互界面)。

---

## app.json（应用级定义）+ app.js
- `app.json`：声明页面集合 `pages`、启动页(第一个)、全局 `window` 样式、跨页基础配置。
- `app.js`：应用级逻辑入口，全局生命周期 + `globalData`。
  - 生命周期：`onLaunch`(初始化,只一次) / `onShow`(启动或后台→前台) / `onHide`(前台→后台) / `onError`(脚本错误或 API 失败)。
- OAF 分层：`AGENTS.md`(描述) → `app.json`(入口/全局) → `app.js`(应用逻辑) → `pages/`(页面交互)。

---

## page — 页面概览
- 两种组织：**多文件**(`index.js`+`.wxml`+`.wxss`+`page.json`，逻辑在 index.js) / **单文件 `.ink`**(逻辑在 `<script setup>`)。生命周期/`data`/事件一致。
- **启动环境(target，由 AIUI 按配置+使用意图决定，非开发者手写)**：
  - `_current`：不离开当前聊天上下文，消息流内展示交互（结果展示/卡片补充/状态回填）。
  - `_blank`：独立窗口/modal，沉浸式（完整流程/表单/多步骤/强交互）。
  - 先以聊天窗口内承载的页面，用户点击后可切到 `_blank` 获更大空间。

---

## page-definition — 页面定义（类微信小程序 `Page`，`export default {}`）
| 属性 | 类型 | 说明 |
|------|------|------|
| `data` | Object | 初始数据（必须 JSON 可序列化；首次以 JSON 字符串从逻辑层传渲染层）|
| `options` | Object | 组件选项 |
| `onLoad/onShow/onReady/onHide/onUnload` | function | 生命周期 |
| `onKeyDown/onKeyUp` | function | 按键事件，`event.code` 取按键编码 |
| `onVoiceWakeup` | function | 语音唤醒，`event.keyword`(默认 `leqi`) |
| 其他 | any | 自定义函数/数据，`this` 访问 |

实例方法：
- `this.setData(data, callback?)`：异步同步到视图层，**支持路径式更新** `'user.name':'New'` / `'a.b.c':1`。
- `this.finish()`：通知页面任务完成 — **Cut(快切)** 智能体交回焦点退出；**Scene(场景)** 智能体结束当前交互流程。

---

## page-lifecycle — 生命周期顺序
- 首次打开：`onLoad` → `onShow` → `onReady`
- 切走/切回：当前页 `onHide`；切回 `onShow`
- 销毁：`onUnload`
- `onLoad`、`onReady` 全局各只一次。

---

## page-events — 页面级事件
- 回调：`onKeyDown`(按下,即时) / `onKeyUp`(抬起) / `onVoiceWakeup`(唤醒,`event.keyword`)。
- **拦截机制**：部分事件除通知页面外还触发宿主默认行为(返回/滚动/激活)。在 `onKeyUp` 调 `event.preventDefault()` 接管，默认行为不再执行。`onKeyDown` 偏即时通知，通常无拦截意义。
- **Rokid Glasses 按键 `event.code`**：
  | code | 默认行为(onKeyUp 不拦截时) |
  |------|------|
  | `Backspace` | 返回上一级 / 无可返回时请求关闭应用 |
  | `ArrowUp` | 向上滚动根视图 |
  | `ArrowDown` | 向下滚动根视图 |
  | `Enter` | 进入导航模式 / 激活当前目标 |
  | `GlobalHook` | 眼镜**镜腿按键触摸**事件（设备侧特殊编码，非标准 Web 键值），承载设备特有快捷交互 |
```javascript
onKeyUp(event){ if(event.code==='Backspace'){ event.preventDefault(); /* 接管返回 */ } }
```
