# 12 · 框架参考 · WXSS

源：`docs/aiui/1-framework/wxss/*`

> WXSS = 类 CSS 样式语言，与标准 CSS **高度兼容**，绝大部分 [MDN CSS](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference) 属性/用法可直接用。`wxss.md` 是占位"建设中"。

---

## 介绍 / 特性（相对 CSS 的扩充）
- **`rpx`(responsive pixel)**：响应式长度，按屏宽自适应，**规定屏宽 = `480rpx`**（故 `240rpx` = 半屏宽）。
- **`@import "./common.wxss"`**：导入外联样式，模块化复用。
- 建议：优先**类选择器**、避免过度嵌套、善用 **Flexbox**（视图引擎底层完美支持）。

## 选择器
类 `.class`(推荐) / ID `#id` / 元素 `text` / 群组 `A, B` / 后代 `A B` / 子元素 `A > B`。

## 伪类
- 交互：`:active`(按下) / `:hover`(悬停) / `:focus`(输入焦点)
- 结构：`:first-child` / `:last-child` / `:nth-child(n)`(支持 `odd`/`even`/公式)
- 状态：`:disabled`（也可属性选择器 `[disabled]`）

## 伪元素
- `::before` / `::after`：⚠️ **必须设 `content`**(哪怕 `""`)；默认 `display:inline`，需宽高要改 block/inline-block。
- `::placeholder`：输入框占位符样式。
- `::-webkit-scrollbar` / `::-webkit-scrollbar-thumb`：滚动条（若平台支持）。

## 属性（标准 CSS 子集，常用分类）
- 布局：Flexbox(`display:flex` + `flex-direction`/`justify-content`/`align-items`/`flex:1`)；定位 `position:fixed/absolute` + `top/left/z-index`。
- 盒模型：`width/height/margin/padding`、`box-sizing:border-box`、`border`、`border-radius`。
- 文本：`font-size/font-weight/color/text-align`；单行省略 `white-space:nowrap;overflow:hidden;text-overflow:ellipsis`。
- 视觉：`box-shadow`、`opacity`。
- 动画：`transition`、`:active` + `transform:scale()`。

## 值类型
- 长度：`rpx`(屏宽 480) / `px` / `vh` / `vw`。
- 颜色：`#hex` / `rgba()` / `hsl()` / `currentcolor`。
- 字符串：引号包裹，主要用于 `content`。
- 关键字：`auto`/`hidden`/`none` 等。
- 数字（无单位）：`flex`/`line-height`/`opacity`/`z-index`。
- 函数值：`calc()`/`linear-gradient()` 等。

## 函数
- `calc(100vw - 60rpx)`、`var(--primary-color, #444)`(配 `:root{--primary-color:...}`)。
- `linear-gradient(180deg,...)`、`rgba()`。
- `url('https://...')`（建议网络路径或 base64）。
- `transform`：`translate()`/`rotate()`/`scale()`，配 `@keyframes` 做动画。

## @规则
- `@import`（须在顶部；示例还出现 `composes:` 引用类——CSS Modules 风格）。
- `@media`（`prefers-color-scheme:dark` 深色模式、`min-width` 等）。
- `@keyframes`（定义动画，配 `animation:`）。
- `@font-face`（加载自定义网络字体 `src:url(...)`）。
