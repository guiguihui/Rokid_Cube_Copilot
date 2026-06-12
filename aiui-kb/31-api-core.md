# 31 · API · 框架 & 核心全局

源：`docs/aiui/3-api/framework/*` + `console`/`crypto`/`encoding`/`performance`/`route`/`speech`

---

## framework/app（App）— 同前：`onLaunch`/`onShow`/`onHide`/`onError` + `globalData`。
## framework/page（Page）— `export default {}`；`this.setData(data, cb?)`(异步,路径式 `'a.b.c':1`)、`this.finish()`(Cut 交回焦点退出 / Scene 结束流程)；生命周期 `onLoad/onShow/onReady/onHide/onUnload`。

---

## framework/global — 全局作用域（Web 标准）
- `window`/`self`/`global`/`globalThis` 指向**同一全局对象**。
- 属性：`window.innerWidth` / `window.innerHeight`。
- 定时器：`setTimeout(cb,delay,...args)`→TimerId、`clearTimeout(id)`、`setInterval`、`clearInterval`。
- Base64：`atob(encoded)` / `btoa(str)`（btoa 仅 Latin1）。
- `fetch(url, options?)` → `Promise<Response>`。
  - **Response**：属性 `ok`(200-299)、`status`、`statusText`、`url`；方法 `text()`/`json()`/`arrayBuffer()`(均 Promise)。
- 全局挂载：`console`、`localStorage`、`speechSynthesis`、`performance`、`TextEncoder`/`TextDecoder`。

## console
- `log`/`info`/`warn`/`error`/`debug`；分组 `group(...)` / `groupEnd()`。
- ⚠️ 对象默认展示**最多 4 层深度**，超出显示 `[Object]`；开 Inspector 时同步到 Chrome DevTools。

## crypto（Web Crypto API）
- 全局 `crypto` 或 `import crypto from 'crypto'`。
- `crypto.randomUUID()` → v4 UUID 字符串。
- `crypto.getRandomValues(typedArray)`（当前主要为占位）。
- `crypto.subtle`(SubtleCrypto，均返回 Promise)：
  - `digest(algorithm, data)`：`SHA-1/256/384/512`，data 支持 String/ArrayBuffer/Uint8Array。
  - `importKey(format, keyData, algorithm, extractable, keyUsages)`：format 仅 `"raw"`。
  - `sign(algorithm, key, data)`：仅 `HMAC` + SHA-1/256/384/512。
- **CryptoKey**：`type`恒 `"secret"`、`extractable`恒 `false`、`usages`恒 `["sign","verify"]`。

## encoding（TextEncoder / TextDecoder，Web 标准）
- **TextEncoder**：恒输出 UTF-8。`encode(input?)`→Uint8Array；`encodeInto(source, dest)`→`{read, written}`(复用缓冲减分配)。`encoding`恒 `"utf-8"`。
- **TextDecoder**：`new TextDecoder(label?='utf-8', {fatal?=false, ignoreBOM?=false})`；`decode(input?, {stream?=false})`→String（input 支持 ArrayBuffer/Uint8Array/DataView）。`fatal:true` 非法字节抛错，否则替换字符。流式解码用 `{stream:true}` 分段，最后 `decode()` 收尾。
- ⚠️ 字符串长度 ≠ 字节长度（中文/emoji 多字节）。

## performance — `Performance` / `performance.now()`（Web 标准性能测量）。

## route — 路由概览（细节在 wx 兼容 router）：`wx.navigateTo({url:'/pages/detail/index?id=1'})` 等。

## speech — 语音概览（细节在 ai/speech-synthesis 与 wx 兼容 speech）。
