# 20 · 组件库

源：`docs/aiui/2-components/*`

> Ink 提供的原生 UI 组件，WXML 编写，**Skia 原生渲染**。属性名用短横线(kebab-case)，事件用 `bind<event>`。

---

## 容器
- **`view`**：基础容器（类 `div`），支持 Flexbox、盒模型、背景/边框。
- **`scroll-view`**：可滚动容器。属性：`scroll-x`/`scroll-y`(默认 false)、`scroll-top`/`scroll-left`、`scroll-into-view`(滚到某 ID)、`auto-scroll`(默认 false)、`scroll-speed`(默认 25.0)、`scroll-direction`(`vertical`/`horizontal`)。支持触摸/拖拽/滚轮。
- **`swiper`**：轮播/多屏切换。`current`、`autoplay`、`interval`(如 3000)。引导页/轮播卡片/多步骤。

## 基础内容
- **`text`**：文本（类 `span`/`p`），支持字体大小/颜色/字重/换行/对齐。
- **`icon`**：图标，本质是特殊 `text`，基于字体图标库(如 Material Icons)。继承 text 全部属性，`font-size`/`color`；用 CSS 设 `font-family`。`<icon class="material-icons">home</icon>`
- **`error-state`**：空/异常/错误状态提示。`title`、`description`，可配按钮做重试/返回。
- **`streamdown`**：流式 Markdown（适合 AI 增量回复）。`content`(默认"")、`streaming`(末尾闪烁光标,默认 false)、`color`、`font-size`。支持标准 markdown + 增量渲染 + 光标动画。

## 表单
- **`button`**：`<button bindtap="handleTap">`，内置触摸反馈。
- **`input`**：单行输入。`value`、`placeholder`、`bindinput`。
- **`textarea`**：多行输入。`value`、`placeholder`、`bindinput`。

## 日期
- **`calendar`**：日历。`current-date`(如 "2026-05-02")、`bindchange`。日期展示/选择/日程。

## 媒体
- **`image`**：图片。`src`、缩放模式(aspect fit/aspect fill)。⚠️ 网络图片**计划中**。
- **`lottie-view`**：Lottie(AE 导出 JSON)动画。`src`、`auto-play`(默认 true)、`loop`(默认 true)、`speed`(默认 1.0)、`progress`(0.0~1.0 手动控制)。暂未抛公共事件。

## Canvas & Chart
- **`canvas`**：2D 绘图（类 HTML5 canvas）。`width`(默认 300)、`height`(默认 150)。
  ```javascript
  const canvas = this.selectComponent('#myCanvas');
  const ctx = canvas.getContext('2d');   // 标准 Web Canvas API
  ctx.fillStyle='red'; ctx.fillRect(10,10,150,75);
  ```
  （注意：与 02-basic 的 `wx.createCanvasContext`+`ctx.draw()` 是两套路径；组件这里用标准 `getContext('2d')`。详见 API `/AIUI/api/canvas`。）
- **`chart`**：数据可视化。
  - `type`：`line`(趋势)/`area`(强调规模)/`pie`(占比)/`radar`(多维对比)，默认 line。
  - `series`(数值字段名,默认 value)、`data`(数据点数组,如 `[{label,value}]`)、`width`/`height`、`animate`、`color`(默认 #00FF7F)、`smooth`(折线/面积,默认 true)、`show-average`(折线/面积平均虚线)。

## AI 组件
- **`a2ui`**：AI 交互容器（语音/多轮对话/任务流）。`agent-id`、`session-id`、`bindmessage`。承载消息流/状态反馈/智能操作入口。
