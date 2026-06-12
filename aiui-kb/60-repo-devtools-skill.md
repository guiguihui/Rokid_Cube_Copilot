# 60 · 开发者工具仓库 & aiui-dev Skill（实现真相）

> 来源：GitHub `jsar-project/AIUI`（本地已 clone 到 `E:\ROKIT\AIUI`，分支 main）。
> 与官网文档 KB 的分工：**官网讲"能做什么"（全景/概念），本仓库讲"当前实现到底支持什么、别瞎编"（实现真理）。**
> ⚠️ 开发 AIUI 应用写代码前，**先查本篇 + `E:\ROKIT\AIUI\skills\aiui-dev\` 下对应 apis-*.md**，那是按真实实现核对过的，优先级高于官网/浏览器标准认知。

---

## 0. 这仓库是什么（一句话）

不是运行时本身，是 **「AIUI 开发者工具箱 + 给 LLM 用的 Skill」**。三根支柱：
```
packages/create-aiui-agent/   脚手架 CLI（npm: @yodaos-pkg/create-aiui-agent v2.1.2）
samples/                       7 个可运行示例：simple(最全) games bluetooth scanner cut-card meal-card
skills/aiui-dev/              ★灵魂：给任意 LLM 即插即用的技能包
.github/workflows/            CI 每天 0:00 自动 npm publish 脚手架
```

## 1. 命名史（读源码会遇到的坑）

同一个东西有三套名字，是改名没清干净：
- **AIUI** = 当前品牌（= 原 **JSUI**，`package.json` 描述/模板里 `Hello JSUI!` 仍是旧名）。
- 底层运行时项目 = **JSAR**（JavaScript AR）/ git remote 写的是 `jsar-project/jsai`。
- 归属 **Rokid YodaOS**（npm 作用域 `@yodaos-pkg`）。`.ink` 后缀来自运行时名 **Ink**。
- ⚠️ README 里的路径 `skills/jsui-dev/`、`packages/create-jsui-agent/` **是错的**，实际是 `aiui-dev`、`create-aiui-agent`。

## 2. AIUI 应用标准骨架（脚手架生成 / 所有 sample 同构）

```
AGENTS.md     Agent 清单：Identity + Capabilities(Permissions: camera/microphone/network/audio; Skills:)
app.json      { "pages":["pages/index/index"], "window":{...}, "fonts":[...] }
app.js        export default { onLaunch(){}, globalData:{} }
pages/x/x.ink 单文件组件（SFC）
assets/       静态资源
```
脚手架机制：递归拷贝 `template/`，替换 `{{PROJECT_NAME}}`。无依赖无交互。

## 3. `.ink` SFC 四块结构（必记）

```html
<script def>   { "navigationBarTitleText": "Home" }         ← 页面级 JSON 配置
<script setup> import wx from 'wx';
               export default { data, onLoad(), handleTap(){ this.setData({...}) } }
<page>         <view><text>{{greeting}}</text>...</view>     ← WXML 模板
<style>        .container{ display:flex; ... }               ← WXSS
```
- 指令前缀 **`ink:`**：`ink:if` / `ink:elif` / `ink:else` / `ink:for` / `ink:key`。
- ⚠️ **不支持嵌套 `ink:for`** → 先在 JS 拍平数据。`ink:for` 内用 `item` / `index`。
- 事件：`bindtap` / `catchtap`(阻止冒泡) / `bindinput` / `bindchange`。
- 硬件按键 = 页面方法（不是 WXML 绑定）：`onKeyDown(e)` / `onKeyUp(e)`。
- ⚠️ **AR 交互模型实测坑**：Craft 平台「Interactive InkView」预览里，左侧画布只是 2D 显示面，**输入走右侧「按键」面板(←↑↓ + 白色确认键)/ 键盘**。**确认键派发的是 `onKeyDown`(`event.code === 'Enter'`)，不是 `bindtap`**；只写 `bindtap` 的元素在 AR 里按确认键不会响应（鼠标直接点画布也不路由成 tap）。可交互元素要同时处理 `onKeyDown` 的确认键。键值是 DOM `code` 风格：`'Enter'` / `'Backspace'` / 方向键 `'Arrow*'`（见 `samples/scanner/pages/camera/index.ink:75` 的 `onKeyDown`）。

## 4. ★核心心智模型：页面 = MCP UI 组件

每个 `.ink` 通过 `<script def>` 里的 `description` + `schema` 把自己声明成一个**可被 AI/系统调用的 UI 组件**：
- `description`：自然语言说"这页 UI 干啥"→ LLM 据此决定何时渲染。
- `schema.data`：JSON Schema，声明渲染所需输入（properties / types / required）。

```json
{ "navigationBarTitleText":"Weather Card",
  "description":"displays current weather for a specific city",
  "schema":{ "data":{ "type":"object",
    "properties":{ "city":{"type":"string"}, "temperature":{"type":"number"},
                   "condition":{"type":"string","enum":["sunny","rainy","cloudy","snowy"]} },
    "required":["city","temperature","condition"] } } }
```

## 5. ★设计硬约束（AR 眼镜，写 UI 必须遵守）

- 宽度**严格 480px**；高 **120–380px**（别做超长滚动页）；**黑底**；**2px** 边框；圆角 **12px**；**卡片式**布局。
- **禁 emoji**（除非显式要求）；**禁大面积纯色块**（AR 透明显示刺眼，颜色只用于强调/文字/交互）。
- 不写死颜色/间距 → 用 token `var(--color-primary)` / `var(--spacing-md)` / `var(--radius-md)` 等（约 90 个 token，全表见 SKILL.md §5.4）。
- 内置绿主题 token：`--color-primary:#40FF5E`，`--app-width:480px`，`--app-height-min/max:120/380px`。

## 6. ★反幻觉清单：实现 ≠ 浏览器标准（最容易栽的坑）

Skill 反复强调 "implementation truth, not Web platform truth"。已核对的**坑点**：

### Canvas2D（`apis-canvas.md`）
- `getContext(type)` **只认 `'2d'`**，其他返回 null。
- `fillStyle`/`strokeStyle` **只解析 12 种颜色**：`#rrggbb` `#rgb` `rgb()` `rgba()` 和 black/white/red/green/blue/yellow/transparent。**别的全忽略**（没有 `hsl`、没有颜色名大全）。
- `createPattern(image,rep)` **是假的**：忽略传入 image，永远用内部 1×1 surface。
- `drawImage()` **只接受另一个 `Canvas` 实例**作源；非 Canvas 直接静默不画；只实现 3/5/9 参三种重载。
- `measureText()` 返回对象**只有 `width`** 一个字段。
- 两种获取 ctx：页面节点 `wx.createCanvasContext('id')`（需 `<canvas id>`，找不到返回 null）；脚本自有 `new Canvas(w,h).getContext('2d')`。

### AI / 语音（`apis-ai.md`）
- `LanguageModel` 单例不可 new。`availability()`→`'available'|'unavailable'`；`create({model?,initialPrompts?,tools?})`→session。
  - `initialPrompts` 角色 system/user/assistant，**system 只能放第一条**；缺 model 时回落 host `defaultModel`，都没有则抛错。
  - `tools` 会转发进请求体，但**结构化 tool-call 执行尚未在 JS 层暴露**。
- `session.prompt(input)`→`Promise<string>`；`promptStreaming(input)`→`LanguageModelTextStream`（**不是** WHATWG ReadableStream，用 `read()`→`{done,value?}` 轮询，`value` 可能 undefined 表示还没到 chunk）。`clone()`/`destroy()`。
  - per-request 角色只能 user/assistant（**不能放 system**）。同一 session 同时只能一个活跃请求。
- ⚠️ `speechSynthesis` **只暴露 `speak()`**；`cancel/pause/resume/getVoices`/生命周期事件**都没有**。`SpeechSynthesisUtterance` 虽有 `lang/rate/pitch/voice/volume` 属性但形同虚设（印证旧 KB `02-basic` vs `30-api-ai` 的矛盾）。
- `SpeechRecognition` 较完整：`start/stop/abort`、`onresult` 等事件；`start()` 在 InkView 非交互态抛 `InvalidStateError`。

### wx 模块（`apis-wx.md`）
- `import wx from 'wx'`，**只有 default 导出**。
- 网络工厂：`wx.request`→RequestTask、`createSocket`/`connectSocket`→SocketTask、`createEventSource`→EventSourceTask(SSE)。
  - `request` 默认 `method=GET`、`responseType='arraybuffer'`、超时回落 60000。success 回 `{data,statusCode,header,cookies,errMsg}`。
- 存储 sync/async 两套（`getStorageSync` 缺键返回 undefined）。语音 `wx.speech.playTTS/startRecognition`，媒体 `wx.media.getRecorderManager/createCameraContext`（不支持时返回 undefined）。

### 设备（`apis-device.md`）
- `navigator.bluetooth`：标准 Web Bluetooth + Ink 特有 `scanDevices()`。GATT 全链：device.gatt.connect → getPrimaryService → getCharacteristic → readValue/writeValue/startNotifications + `characteristicvaluechanged` 事件。
- 传感器：`new Accelerometer/Gyroscope/AbsoluteOrientationSensor({frequency})`，EventTarget，事件 `activate/reading/error`；首次 reading 后 `activated/hasReading` 翻 true；orientation 的 `quaternion` 是 `[x,y,z,w]`。
- ⚠️ **交互门控（interactive gate）**：`requestDevice/scanDevices/gatt.connect/startNotifications`、`recorder.start`、`camera.takePhoto`、`startRecognition` 都**要求 InkView 处于 interactive 态**，否则抛错。`getAvailability/getDevices` 不受限。

### 媒体（`apis-media.md`）
- `new Sound(localPath)`：**仅本地文件**，http(s) 被拒；`play()`(从头重播)/`stop()`/`destroy()`(后再调用抛错)；无 seek/streaming/事件。

## 7. 内置组件（`components.md`，18 个）

`view text icon image button canvas scroll-view chart input textarea switch lottie-view streamdown a2ui error-state` + 别名 `swiper/swiper-item/fragment`。
关键实现真相：
- ⚠️ **别名**：`swiper/swiper-item/fragment` 当前都只是 `view`（**没有轮播功能**，别指望 autoplay/indicator）；`icon` 只是 `text`（无图标包 API，靠字体字形）。
- 布局/尺寸/边框/色彩**主要靠 WXSS**，不是组件 props。tap 由框架层在 TouchEnd/MouseUp 统一处理。
- `image` 的 `mode` 实现了 `widthFix`/`heightFix`。`scroll-view` 需显式 `scroll-x/y="true"` 才滚，支持 `scroll-into-view`/`auto-scroll`。
- `chart` 支持 line/area/pie/radar，kebab 与 camel 双写法（`y-axis`/`yAxis`）。
- `input`/`textarea`：`bindinput`→`e.detail.value`。`switch`：`bindchange`→`e.detail.value`(bool)。
- `lottie-view` 属性是 **`auto-play`**（不是 autoplay）。`streamdown`(流式 markdown,有 caret)、`a2ui`(渲染 A2UI command 流，`a2ui.createA2UIContext(id).write(json)`)。

## 8. skills-lock.json —— 把"喂给 AI 的上下文"当一等依赖锁定

`samples/games/skills-lock.json` 揭示 Skill 系统有锁文件机制（类比 package-lock）：
```json
{ "version":1, "skills":{ "aiui-dev":{
  "source":"jsar-project/AIUI", "ref":"main", "sourceType":"github",
  "skillPath":"skills/aiui-dev/SKILL.md", "computedHash":"d59c2279…" } } }
```
即工程可声明依赖哪些 AI 技能、锁到 hash，保证团队/CI 喂给 AI 的上下文一致可复现。
安装：`npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev`。

## 9. 速用入口

- 建工程：`npm create @yodaos-pkg/aiui-agent my-agent`
- 学样例：`E:\ROKIT\AIUI\samples\simple\pages\*`（layout/grid/canvas/chart/a2ui/audio/lottie… 一页一特性）
- 查 API 真相：`E:\ROKIT\AIUI\skills\aiui-dev\{SKILL,apis,apis-ai,apis-canvas,apis-device,apis-media,apis-wx,components}.md`
