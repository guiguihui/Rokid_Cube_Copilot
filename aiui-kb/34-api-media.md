# 34 · API · 多媒体

源：`docs/aiui/3-api/media*`

> 音效 Sound（轻量本地）/ AudioPlayer（推荐，硬解码）/ Audio(Web AudioContext) / 相机 / 录音。

---

## Sound — 本地短音效（按钮/提示音，高频重播）
- `new Sound(src)` 或 `import { Sound } from 'audio'`。`src` 须非空字符串，**仅本地文件**(不支持 http/https)。
- 属性 `volume`(读写)。方法 `play()`(若在播则先停再从头)、`stop()`、`destroy()`(后再调方法抛错)。
- ⚠️ 不支持改 src / seek / 流式追加 / 事件监听。

## AudioPlayer — 推荐音频播放（本地+流式，硬件解码、低功耗）
> 为何不用 AudioContext：AudioContext 处理 PCM 在软件层，失去硬解码能力、增功耗。AudioPlayer 是 `HTMLAudioElement` 的替代，硬件加速。
- `new AudioPlayer(options?)`（options 含 `audio_setting` 等）。
- 属性：`src`、`startTime`、`autoplay`(默认 false)、`loop`(默认 false)、`volume`(0~1)、`currentTime`(可设=seek)；只读 `duration`/`sampleRate`/`channels`/`paused`/`buffered`。
- 方法：`play()`/`pause()`/`stop()`/`seek(position)`/`destroy()`；流式：`append(buffer)`(追加 ArrayBuffer/TypedArray)、`finish()`(标记追加结束)、`setBuffer(data, hint?)`(直接设完整数据，hint 如 "mp3")。
- 事件(`onXxx(cb)` + 对应 `offXxx([cb])`)：`onCanplay`/`onPlay`/`onPause`/`onStop`/`onEnded`/`onTimeUpdate`/`onSeeking`/`onSeeked`/`onError`/`onWaiting`。

## Audio（Web 标准）— `AudioContext` / `AudioBuffer` / `AudioBufferSourceNode`。

## 相机（wx 兼容）
- `const ctx = wx.createCameraContext()` → `CameraContext`(页面逻辑与相机组件的桥梁)。
- ⚠️ 建议在 `onReady()` 后创建（确保相机视图就绪）。

## 录音（wx 兼容）
- `const rm = wx.getRecorderManager()` → `RecorderManager`(**全局唯一**，管理录音生命周期)。
- ⚠️ 勿在多页/多分支重复维护实例；建议在 `onLoad` 获取。
