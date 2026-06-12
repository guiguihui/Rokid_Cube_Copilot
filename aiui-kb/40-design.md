# 40 · 设计规范

源：`docs/aiui/4-design/*`

---

## interaction — 交互设计
- Rokid Glasses 交互方式：
  - **语音输入**（最核心，结合 Rokid 语音能力的自然语言交互）。
  - **镜腿触摸/轻拍**：滑动(列表滚动/页面切换/参数调节)、点击/轻拍(确认/触发动作)。
  - **头部追踪**：随动与空间定位平衡，调整视角与信息位置。
- 指南：① 反馈及时性(每个动作都要有视觉/音效反馈)；② 安全区域(核心元素在舒适 FOV 内)。

---

## visual — 视觉设计（核心：基于 Design Tokens + 宿主主题机制）
- 原则：清晰性(各光照/视距可读) / 层次感 / 品牌一致(绿色主题) / 简洁(不挡主视角) / 可主题化。
- **主题机制**：主题本质是一份 CSS，用 CSS 自定义属性(Design Tokens) 定义。宿主先注入主题作默认 token 层，应用可在 `app.wxss`/页面/组件样式覆盖；不同主题复用一致 token 结构。
- **推荐主题**：Rokid Glasses 单绿色显示用 Ink 内置 `yodaos-sprite-greenonly`（黑底绿前景，保证对比度）。
- 关键 Tokens：
  - 布局：`--app-width:480px`、`--app-height-min:120px`、`--app-height-max:380px`(超过进滚动)。
  - 颜色：`--color-primary:#40ff5e`、`-60:rgba(64,255,94,.6)`、`-40:rgba(...,.4)`；`--color-background/surface:#000`；`--color-text-primary:var(--color-primary)`、`-secondary:var(--color-primary-60)`。
  - 边框宽：thin 1px / default 2px / strong 4px；圆角 `--radius-sm/md:12px`；间距 sm 8 / md 12 / lg 18px。
  - 组件：Card(`--card-padding`/`--card-cover-height:180px`)、Input(`--input-background-color:rgba(64,255,94,.08)`/padding-y 10/padding-x 14)、Error State。
- 建议：从 token 出发别写死颜色/间距；优先用边框+文字亮度+surface 层级表达强调，**少用阴影**(透明 AR 环境)；复用 card/input/error-state token。
- 主题文件参考：`packages/ink/themes/yodaos-sprite-greenonly.theme.css`。

---

## resources — 资源下载
- 设计工具：Figma UI Kit（基础组件源文件）、图标库（AR 优化 SVG）、Sketch 模板。

## more — 更多
- 动效/音效/多模态交互规范即将上线；建议联系 Rokid 设计团队。
