# Rokid Glasses / AIUI 硬件 · 软件 API 开发参考

> 用途：把"做方案/写代码时随时要查"的硬件能力与软件 API 汇总到一处，避免反复翻 KB 或临场推断。
> 来源：`E:\ROKIT\aiui-kb\*`（官方文档摘录）+ `AIUI\skills\aiui-dev\*`（已验证 API）+ 本项目真机/Craft 实测经验。
> 标注约定：**✅ 文档证实** · **🧪 本项目实测/经验** · **❓ 文档未给、需真机实测**。
> 最后更新：2026-06-17。配套：产品文档 `魔方还原助手_MVP_产品设计.md`、开发日志 `开发状态.md`。

---

## 0. 一页速记（最常踩/最常用）

- 运行时是 **QuickJS(2024-01-13)+Skia**，纯解释器：**无 Worker、无 WebAssembly**，重同步计算冻屏 → 大表/百万级 BFS 必须**离线烘焙**或**走云端**。
- 相机 **只有 `takePhoto()`**，**没有实时视频流/连续帧 API** → 无法实时识别/AR 配准；`<camera>` 只是系统预览层，JS 读不到帧。
- **没有端侧 ML/NPU API**（`createInferenceSession` 不存在，是臆想）。
- 跨页数据用 **`wx.setStorageSync/getStorageSync`**（Web `localStorage` 在 Ink 里不跨页可靠共享）。
- `navigateTo` 用**绝对路径** `'/pages/xx/index'`。
- `.ink` 生命周期实测：**画布绘制/相机创建放 `onShow`**（`onReady` 文档有列但本项目实测不可靠）。
- `ink:for` **不能嵌套**；多组用多个平级 `ink:for`。
- 显示：**单绿 Micro-LED**，画布逻辑宽 **480px**、高 120–380px（超出滚动）。
- 网络在眼镜上经 **蓝牙→手机 App** 承载，注意弱网/延迟。

---

## 1. 运行时与 JavaScript 能力

| 项 | 内容 |
|----|------|
| 引擎 | ✅ Ink 容器 = **QuickJS 2024-01-13** + Skia 渲染，完整 **ES2023** |
| 语言特性 | ✅ Promise/async-await、Map/Set/WeakMap/WeakSet、可选链 `?.`、空值合并 `??`、ES Modules、BigInt、TypedArray |
| 线程/并发 | ✅ 无 Web Worker；逻辑层+视图层单循环，**重同步计算阻塞渲染**（性能文档要求避免高频 `setData`、可穿戴会降频） |
| WASM | ✅ **无 WebAssembly**（不在全局清单；QuickJS 不含）→ WASM/asm.js 求解器、Emscripten 产物不可用 |
| 全局对象 | ✅ `window/self/global/globalThis`(同一对象)、`window.innerWidth/innerHeight`、`setTimeout/Interval`、`atob/btoa`(仅 Latin1)、`console`(对象默认 4 层深)、`performance.now()` |
| 编码 | ✅ `TextEncoder`(恒 UTF-8)/`TextDecoder`(支持流式 `{stream:true}`) |
| 加密 | ✅ `crypto.randomUUID()`、`crypto.subtle.digest`(SHA-1/256/384/512)、`sign`(仅 HMAC)；`getRandomValues` 多为占位 |
| Web 标准底座 | ✅ WinterCG Minimum Common Web API：`fetch`/`URL`/`TextEncoder`/`Web Crypto` 等通用，多数纯 JS npm 包可无缝跑 |
| 内存 | ❓ 极低功耗/内存设备，RAM 上限文档未给；可用 `wx.getSystemInfo` 探，但是否含可用内存不确定 → 烘焙表等大内存方案**须真机实测** |

**性能红线**：合并 `setData`；只传视图需要的数据，勿传大对象；长列表复用节点；启动减包体、可分包加载。

---

## 2. 显示与设计规范

- ✅ **单色（绿）Micro-LED**；推荐主题 `yodaos-sprite-greenonly`（黑底绿前景）。
- ✅ 布局 Tokens：`--app-width:480px`、`--app-height-min:120px`、`--app-height-max:380px`（超出进滚动）。
- ✅ 颜色 Tokens：`--color-primary:#40ff5e`、次级 `rgba(64,255,94,.6)`/`.4`；背景/surface `#000`。
- ✅ 边框 thin1/default2/strong4px；圆角 12px；间距 8/12/18px。
- ✅ 透明 AR 环境**少用阴影**，用边框+亮度+surface 层级表达强调；核心元素放舒适 FOV 安全区。
- ❓ 物理分辨率/FOV 因设备而异（运行时文档明示有差异），以 480px 逻辑画布为设计基准。

---

## 3. 交互输入

| 通道 | 能力 |
|------|------|
| 硬件键 | 🧪 本机只有 **向前 / 向后 / 单击 / 双击**（单轴线性，无四方向键、不能任意点选元素）。页面 `onKeyDown(event)`/`onKeyUp(event)` 收键。|
| 键码映射 | 🧪 代码现用：forward=`ArrowDown`/`ArrowRight`、back=`ArrowUp`/`ArrowLeft`、确认/单击=`Enter`/`Space`/`NumpadEnter`、返回=`Backspace`。**真实 code 待 `lastKey` 调试行确认**。|
| 镜腿触摸 | ✅ 设计文档：滑动(滚动/切换/调参)、点击/轻拍(确认)。`bindtap`/`catchtap` 由框架在 TouchEnd/MouseUp 触发。|
| 语音 | ✅ 最核心通道（见 §6）。|
| 头部追踪 | ✅ 调整视角/信息位置（传感器见 §7）。|

> 设计原则：每个动作都要有视觉/音效反馈。

---

## 4. 相机与图像

| 项 | 内容 |
|----|------|
| 入口 | ✅ `wx.media.createCameraContext()` → `CameraContext`（或 `undefined`，能力不可用时）。建议 `onShow` 创建。|
| 拍照 | ✅ **`takePhoto(options)`** → `{data:ArrayBuffer, mimeType}`；**必须在交互回调里调**；失败 reject。`{quality:'high'}` 实测可用。|
| 实时帧 | ✅ **无任何连续帧/预览帧 API**。`onFrameRecorded` 属**录音** RecorderManager(frameBuffer=音频)，与相机无关。→ 实时识别/AR 配准在 API 层不存在。|
| `<camera>` 组件 | 🧪 仅系统预览层，JS 读不到帧；真机实测**不提供稳定实时预览**（只在拍照前后出现单帧），不能作对齐依据。|
| 照片格式 | 🧪 真机多为 **webp**；Craft 的 webcam 截图为 **png/jpeg**。按 magic 字节分流解码。|
| 分辨率/FOV | 🧪 **广角**（魔方占画面约 1/6，"中央 66%"采样会framings背景）；❓ 具体像素/FOV 文档未给。|
| 本项目解码器 | 🧪 `lib/webp.js`(scanner 来)、`lib/png.js`(+`vendor/tiny-inflate.js`)、`lib/jpeg.js`(+`vendor/jpeg-decoder.js`)，均 node 验证；`decodeFrame()` 按 magic 字节嗅探。输出 `{width,height,rgba}`。|

---

## 5. Canvas（两套路径）

| 路径 | 用法 | 能力 |
|------|------|------|
| 小程序式 | 🧪 `wx.createCanvasContext('id')`（本项目 guide 页用此，**实测可用**，`ctx.flush()` 提交） | fillRect/strokeRect/fillText/arc/路径/变换；颜色仅 `#rrggbb`/`#rgb`/`rgb()`/`rgba()`/具名色 |
| 标准 Web | ✅ `this.selectComponent('#id').getContext('2d')`（标准 CanvasRenderingContext2D） | 完整 2D：含 **`drawImage`(3/5/9参)、`getImageData`/`putImageData`/`createImageData`**、渐变、图案 |
| wx 像素接口 | ✅ `wx.canvasGetImageData`/`wx.canvasPutImageData`/`wx.canvasToTempFilePath`(导出图片) | — |

> 含义：要把"拍到的一帧"画到屏幕（如快照复核），标准路径的 `putImageData`/`drawImage` 或 wx 像素接口可行；最稳妥兜底是把降采样像素当色块 `fillRect` 画（基础 API 必支持）。
> ⚠️ 本项目记忆约定优先用 `wx.createCanvasContext`（guide 页已跑通），换标准路径前先小样验证。

---

## 6. 音频与语音

| 能力 | API | 备注 |
|------|-----|------|
| 短音效 | ✅ `new Sound(src)`/`import {Sound} from 'audio'`，`play/stop/destroy`，`volume` | **仅本地文件**，不支持改 src/seek/事件 |
| 音频播放 | ✅ `new AudioPlayer()`（硬解码、低功耗，推荐），支持流式 `append/finish/setBuffer`、事件齐全 | 优于 AudioContext |
| 语音识别 STT | ✅ `new SpeechRecognition()`；`onresult`(`results[0][0].transcript`)/`onerror`/`onend`；`start/stop/abort` | **同实例勿并发**；单次后需重新 start。也可 `wx.getSpeechRecognizer()`(全局唯一) |
| 语音播报 TTS | ✅ `new SpeechSynthesisUtterance(text)`+`speechSynthesis.speak(u, 'immediate'\|'enqueue')` | ⚠️ **`lang/pitch/rate/volume/voice` 暂未生效**；`cancel/pause/resume/getVoices`、生命周期事件未暴露 → 只能默认嗓音 |

---

## 7. AI / 计算

| 能力 | API | 备注 |
|------|-----|------|
| 大模型 | ✅ `LanguageModel`：`availability()`/`create({model,initialPrompts,tools})`/`session.prompt()`/`promptStreaming()`/`clone()`/`destroy()` | **云端**模型；`tools` 仅声明、不自动回调结构化 tool call；会话非全局单例、用完 destroy |
| 端侧推理 | ✅ **无**。无 `createInferenceSession`、无 NPU 暴露 | → 端侧跑视觉/ML 模型识别魔方不可行 |

---

## 8. 传感器

- ✅ `Accelerometer` / `Gyroscope` / `AbsoluteOrientationSensor`（四元数 `[x,y,z,w]`）。
- ✅ 通用模式：`new X({frequency:60})`，事件 `activate`/`reading`/`error`，`start()`/`stop()`；首读前各轴 `null`。
- ⚠️ 四元数勿假设可直接得欧拉角/真北；绑 UI 控更新频率防抖。
- 用途：头部姿态/晃动检测；对魔方色块识别无直接帮助。

---

## 9. 网络（重要：可把重计算/识别甩到云端）

| 方式 | API | 何时用 |
|------|-----|--------|
| HTTPS | ✅ `fetch(url,opts)`→`Response`(`ok/status`,`text()/json()/arrayBuffer()`)；或 `wx.request`(`responseType:'arraybuffer'`, 分块 `onChunkReceived`) | 一次请求一次返回：配置/表单/**云端求解**/智能体结果 |
| SSE | ✅ `new EventSource(url)` `onmessage/onerror`；或 `wx.createEventSource` | 服务端单向持续推送（进度/文本增量） |
| WebSocket | ✅ `new WebSocket(wss://)`；或 `wx.connectSocket`→SocketTask `send/close/onMessage` | 双向低延迟（实时控制/协作）；设计心跳+断线重连 |
| URL | ✅ `new URL()` / `URLSearchParams` | 拼参 |
| 开放服务 | ✅ `import {createOpenAPI} from 'open'` → Rokid 云平台增强能力 | 调 Rokid 云端服务 |

> ⚠️ **眼镜上 HTTPS 经蓝牙→手机 App 链路承载** → 有额外延迟、受弱网影响；做云端方案要容忍秒级 RTT、加超时与离线兜底。
> **对求解器的含义**：54 面字符串发云端跑真·Kociemba 返回 ~20 步解，端侧零建表/零内存压力——是"近最优+快"的强选项，代价是联网。

---

## 10. 存储

| 方式 | API | 备注 |
|------|-----|------|
| 跨页/持久(推荐) | 🧪 `wx.setStorageSync(k,data)`/`getStorageSync(k)`(无则 undefined)/`removeStorageSync`/`clearStorageSync`；异步版 `wx.setStorage(...)` | 本项目跨页通道（键 `cube.moves`/`cube.scannedGrid`）|
| Web Storage | ✅ `localStorage`(getItem/setItem/removeItem/clear，value 须字符串，存对象先 `JSON.stringify`)、`sessionStorage` | 🧪 **Web localStorage 在 Ink 里不跨页可靠共享**，跨页一律用 wx 存储 |
| 隔离性 | ✅ **按 Agent 隔离**，不同 agent 互不可访问；无过期时间 | — |
| base64↔buffer | ✅ `wx.base64ToArrayBuffer`/`wx.arrayBufferToBase64` | — |

---

## 11. 蓝牙（可连智能魔方）

- ✅ `navigator.bluetooth`（Web Bluetooth 子集）：`getAvailability/getDevices/requestDevice/scanDevices`。
- ✅ 连接：`device.gatt.connect()`→`getPrimaryService(uuid)`→`getCharacteristic(uuid)`→`startNotifications()`+`addEventListener('characteristicvaluechanged')`。
- ⚠️ 启动新能力需 InkView 可交互；`scanDevices` 是 Ink 特有。
- 用途：连蓝牙智能魔方拿实时状态（OpenAI 也靠改造智能魔方绕过纯视觉难题）——属远期/可选路线。

---

## 12. 系统信息 / UI 交互 / 路由 / 生命周期

- ✅ 系统信息：`wx.getSystemInfo`/`getSystemInfoSync`/`getDeviceInfo`/`getWindowInfo`/`getAppBaseInfo`/`getAppAuthorizeSetting`（可探设备/窗口信息；❓ 是否报可用内存待真机看）。
- ✅ UI：`wx.showToast/hideToast`、`showModal`、`showLoading/hideLoading`、`showActionSheet`。
- ✅ 路由：`wx.navigateTo/redirectTo/reLaunch/switchTab/navigateBack`、`wx.exitMiniProgram()`。🧪 **url 用绝对路径** `/pages/xx/index`。
- ✅ 生命周期：App `onLaunch/onShow/onHide/onError`+`globalData`；Page 文档列 `onLoad/onShow/onReady/onHide/onUnload`。🧪 **本项目实测：画布绘制/相机创建放 `onShow`**（`onReady` 不可靠，曾致 canvas 全黑）。`setData(data,cb)` 异步、支持路径式 `'a.b.c'`。

---

## 13. 求解器约束与可行路线（项目专项）

- ✅/🧪 **运行时建表必冻屏**：cubejs/Kociemba `initSolver` 做百万级 BFS（node 2–5s，rquickjs ×10–40 → 数十秒冻屏），且**无 Worker 可卸载** → 运行时建表方案死路。
- 候选（详见产品文档 §12 与求解调研）：
  1. **云端 Kociemba（fetch/WS）**：~20 步，端侧零负担，真·近毫秒+网络延迟；需联网。
  2. **min2phase + 离线烘焙剪枝表（纯端侧）**：~20–23 步，表 ~1–4MB(❓实测)，单次搜索估 0.2–2s(❓实测)，不冻屏；纯 JS 可跑。
  3. CFOP/LBL 表-free（现状 `rubiks-cube-solver`）：~15ms 但 50–130 步，太长。
  4. ❌ WASM 两阶段、Korf 最优、端侧视觉模型：本硬件不可行。

---

## 14. 本项目已有资源速查（`E:\ROKIT`）

| 路径 | 作用 |
|------|------|
| `lib/cube.js` | 颜色↔面映射、`gridToRcs`、`validate`(具体原因)、`SCRAMBLE_GRID`、`nextColor`、`cloneGrid` |
| `lib/solver.js` | `solve(grid)`(CFOP→归一化)、`scrambledGrid()`、selfTest |
| `lib/colors.js` | `rgbToHsv`/`classifyColor`/`sampleFace`(中央 66% 3×3)，阈值在 `CONFIG` |
| `lib/webp.js`/`png.js`/`jpeg.js`/`vendor/*` | 图像解码（webp/png/jpeg + tiny-inflate/jpeg-decoder/cube-solver） |
| `lib/moves.js` | 转动记号解析→新手文案 |
| `lib/testImages.js` | `loadTestFrame(face)` 绕过摄像头 |
| `pages/input` | 首页：六面展示+逐格改色+具体校验（版本号在此） |
| `pages/scan` | 扫描：相机+引导框+拍照识别+逐格纠错 |
| `pages/guide` | 引导：canvas 箭头+步数+语音 |

---

## 15. 关键坑位汇总（踩过的）

1. 🧪 运行时重计算冻屏 → 大表离线烘焙/走云端。
2. 🧪 `navigateTo` 相对路径会拼错 → 绝对路径。
3. 🧪 跨页 Web `localStorage` 不可靠 → `wx.setStorageSync`。
4. 🧪 `onReady` 里绘制/建相机不生效 → 放 `onShow`。
5. 🧪 `ink:for` 不能嵌套 → 多个平级。
6. 🧪 相机无实时流、`<camera>` 无稳定预览 → 不能靠"对齐眼前框"，须"拍照→看结果→纠错"。
7. 🧪 takePhoto 格式随环境（webp/png/jpeg）→ magic 字节分流。
8. ✅ TTS 仅默认嗓音；颜色字符串受限；console 对象 4 层深。
