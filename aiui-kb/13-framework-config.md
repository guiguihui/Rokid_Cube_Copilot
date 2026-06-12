# 13 · 框架参考 · 结构 & 配置

源：`docs/aiui/1-framework/structure/*` + `docs/aiui/1-framework/config/*`

> 多与「04-guide-config」「03/09」重叠，这里记差异/补充点。

---

## structure/app — App(app.js)
`export default { onLaunch(options){}, onShow(options){}, onHide(){}, globalData:{} }`
生命周期：`onLaunch`(只一次) / `onShow` / `onHide` / `onError`。

## structure/page — Page
- 两种组织（多文件 / `.ink` 单文件），生命周期/`data`/事件一致，遵循类小程序 `Page` 规范。
- 参数对象：`data` / `options` / `onLoad` / `onShow` / `onReady` / `onHide` / `onUnload` / 其他(any，**页面实例创建时深拷贝一次**)。
- 顺序：`onLoad`→`onShow`→`onReady`；切走 `onHide`，切回 `onShow`；销毁 `onUnload`。
- `data` 须 JSON 可序列化（首次以 JSON 字符串从逻辑层传渲染层）。

## config/agents — 同 04 的 AGENTS.md 规范（基础信息/System Prompts/Capabilities/Configuration/Dependencies；最小权限原则）。

## config/global — app.json 配全局属性（页面路径/窗口样式/多标签）；项目还需 AGENTS.md。

## config/page — 页面配置（补充字段）
- 多文件 → `page.json`；字段 `navigationBarTitleText`、`description`(页面作为可调用 UI 能力时说明用途)、`schema.data`(JSON Schema 入参，可含 `default`，如 `days:{type:integer,default:3}`)。
- `.ink` 单文件 → 写在 `<script def>`；应用入口仍由 `app.json` 管理。
