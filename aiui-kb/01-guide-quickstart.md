# 01 · 快速开始 + 目录结构

源：`docs/aiui/0-guide/quickstart/*` + `0-guide/structure.md`

---

## intro — 什么是 AIUI？

- **AIUI = AI-Native User Interface**：AI 不只输出文字，而是把理解结果组织成可操作界面。
- 两种交互形态：
  - **对话内交互(in-chat)**：UI 以卡片/表单/结果块嵌在聊天流（天气卡片、行程建议、表单）。
  - **沉浸式交互(standalone)**：独立界面承载完整交互（斗地主、任务面板、游戏），可结合语音操作。
- **三种实现路线**：
  | 路线 | 机制 | 特点 | 适合 |
  |------|------|------|------|
  | Tool Rendering | LLM `tools` 注册 UI 能力(如`render_weather_card`)，模型发起 Tool Call，前端预定义组件渲染 | 高控制低自由度 | 固定卡片/表单，需稳定可控可调试 |
  | MCP Apps | 同样 `tools` 注册，但宿主加载独立受控界面(iframe等)，AIUI 的 `InkView` 在沙箱跑 | 内联完整交互界面 | 图表/仪表盘/画布 |
  | A2UI | 声明式 Generative UI，模型输出结构化 commands | JSONL/流式/跨平台友好 | 流式卡片/列表/指标面板 |
  - A2UI 三步 commands：`surfaceUpdate`(声明组件) → `dataModelUpdate`(注入数据) → `beginRendering`(开始渲染)；组件分基础(`Text`/`Image`/`Card`/`List`)与业务(`Metric`/`StatusBadge`/自定义 catalog)。
  - 选型：重可解释/调试→Tool Rendering；要独立受控内联界面→MCP Apps；受控生成→A2UI。常组合使用。
- **Tool Rendering 示例**（关键代码）：
  ```json
  { "name":"render_weather_card","description":"Render a weather card for a city",
    "input_schema":{"type":"object","properties":{"location":{"type":"string"}},"required":["location"]}}
  ```
  前端把参数放进 `query`，页面 `onLoad(query)` 接收 → `setData` 渲染。模板用 `ink:if`/`ink:else`。
- **为何兼容微信小程序**：① 成熟生态零门槛迁移 ② 一套 Agent 多端部署(AR眼镜/手机/桌面) ③ 原生 Web API 支持。
- 差异化：意图驱动(AI 在开发者定义的逻辑框架内实时组装界面) + AR 眼镜低功耗优化。

---

## index — 文档导航

顶部导航 6 模块：**快速了解 / 智能体框架 / 组件 / API / 开发者工具 / 更新日志**；右上角切换文档版本。

---

## first-chat — 第一个对话式 AIUI

- 目标形态：AI 在对话上下文里**插入可交互界面**（天气卡片/行程确认/可筛选结果列表），交互留在当前对话，不跳独立界面。
- 创建：`npm create @yodaos-pkg/aiui-agent my-aiui-chat-agent`
- 目录：`app.js` / `app.json` / `AGENTS.md` / `pages/weather/index.ink`
- **`.ink` 单文件组件四部分**：
  - `<script def>`：页面配置 + `description` + `schema.data`（**把页面声明成可调用工具**）
  - `<script setup>`：`export default { data, onLoad(query){...}, 方法() }`
  - `<page>`：结构（`<view>`/`<text>`/`<button bindtap="...">`，`ink:if`/`ink:else`，`{{ }}` 绑定）
  - `<style>`：CSS（flex、`rpx`/`px`、渐变等）
- 天气卡片 `script def` 关键结构：
  ```json
  {"navigationBarTitleText":"Weather Card",
   "description":"天气相关问题优先返回此工具...",
   "schema":{"data":{"type":"object",
     "properties":{"location":{"type":"string","description":"目标城市名称..."},
                   "date":{"type":"string","description":"yyyy-mm-dd"}},
     "required":["location"]}}}
  ```
  逻辑：`onLoad(query)` 取 `query.location||'杭州'` → setData。⚠️ `.ink` 里内嵌 `<script>` 结束标签要写成 `<\/script>`。
- 与普通聊天区别：输出不再只是文本 / UI 与对话上下文连续 / 用户操作发生在消息内部。
- 入门场景：天气卡片、行程确认、搜索结果、待办确认、表单补充。

---

## first-immersive — 第一个沉浸式 AIUI

- 与对话式两大区别：
  1. **不是页面 tool，而是直接调起整个 agent**：通过 `AGENTS.md` 的 `## Description` 调起 agent，运行时进入 `app.json` 的 `pages` 第一个页面作为起点。页面不把自己声明成 tool。
     ```json
     {"pages":["pages/landlord/index"],"window":{"navigationBarTitleText":"斗地主"}}
     ```
  2. **独立上下文，语音交互需自行实现**：用 `SSE`/`WebSocket`/`fetch` 自己接通 ASR→LLM→TTS 链路（采集输入→发送→接收流式→更新界面→语音播报）。成本高但高度可定制。
- 创建：`npm create @yodaos-pkg/aiui-agent my-aiui-immersive-agent`，页面 `pages/landlord/index.ink`
- 斗地主示例：`data` 含 `statusText`/`handCards`/`selectedCards`；方法 `playCards`/`passTurn`/`askAgentTip`；模板用 `ink:for="{{ handCards }}" ink:key="*this"` 渲染手牌。
- 重点：用户关注"界面正在发生什么"而非"AI 说了什么"。
- 入门场景：回合制小游戏、任务/设备控制面板、长流程工具界面、需持续状态反馈的界面。

---

## ai-dev — 使用 AI 开发

- 提供 **`aiui-dev` Skill**（基于 vercel-labs/skills 生态），给 Coding Agent 注入 AIUI 开发上下文。
- 安装：`npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev`
- 能力：理解项目结构(`AGENTS.md`/`app.json`/`app.js`/`pages/`/`assets/`)、生成 `.ink` 规范代码、页面配置与 `schema/data` 设计、WXML/WXSS、内置组件与 `wx.*`/Web API、设计规范、调试与小程序迁移。
- 支持项目级/全局安装，可装到不同 Coding Agent。参考 npm 包 `skills`。

---

## structure — 代码构成与目录结构

- **两种结构**：
  - **传统多文件**：全局 `app.js`(全局生命周期)/`app.json`(页面路径+窗口)/`app.wxss`(全局样式)/`AGENTS.md`(智能体能力/系统指令/元数据)；每个页面在 `pages/<name>/` 下 `page.wxml`+`page.wxss`(局部)+`page.js`+`page.json`(可覆盖全局)。
  - **单文件组件 SFC(`.ink`)**：`<script def>`(=.json) + `<script setup>`(=.js) + `<page>`(=.wxml) + `<style>`(=.wxss)。
- `.ink` 命名来源：底层运行时是 **Ink**。
- ⚠️ 同一页面同时存在多文件与 `.ink` 时，**框架优先加载 `.ink`**。
- 优势：关注点分离、减少文件碎片、开发体验接近 Vue。
