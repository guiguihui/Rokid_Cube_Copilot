# 37 · API · 微信小程序兼容（`wx.*`）

源：`docs/aiui/3-api/weixin-compatible-apis*`

> 目的：兼容部分微信小程序生态，便于平滑迁移/复用现有小程序代码。

---

## base 基础
- `wx.env`、`wx.canIUse(schema)`、`wx.base64ToArrayBuffer(base64)`、`wx.arrayBufferToBase64(buffer)`。

## router 路由
- `wx.switchTab`(跳 tabBar 并关其他非 tabBar)、`wx.reLaunch`(关所有→打开某页)、`wx.redirectTo`(关当前→跳，不可到 tabbar)、`wx.navigateTo`(留当前→跳，不可到 tabbar)、`wx.navigateBack`(关当前→返回上一/多级)。

## storage 存储
- 同步：`wx.setStorageSync(key,data)` / `wx.getStorageSync(key)`(无则 undefined) / `wx.removeStorageSync(key)` / `wx.clearStorageSync()`。
- 异步：`wx.setStorage/getStorage/removeStorage/clearStorage({key,data,success,fail,complete})`；getStorage success 回 `{data}`，fail 回 `{errMsg}`。

## system 系统信息
- `wx.getSystemInfo` / `wx.getSystemInfoSync` / `wx.getDeviceInfo` / `wx.getWindowInfo` / `wx.getAppBaseInfo` / `wx.getAppAuthorizeSetting`。

## ui 界面交互
- `wx.showToast`/`wx.hideToast`、`wx.showModal`、`wx.showLoading`/`wx.hideLoading`、`wx.showActionSheet`。

## speech 语音（Rokid 特有）
- `wx.getSpeechSynthesizer()`(全局唯一合成器)、`wx.getSpeechRecognizer()`(全局唯一识别器)。

## media 多媒体
- `wx.createCameraContext()`→CameraContext；`wx.getRecorderManager()`→RecorderManager(全局唯一)。

## canvas 画布
- `wx.createCanvasContext(canvasId, this)`→CanvasContext；`wx.canvasToTempFilePath`(导出图片)、`wx.canvasGetImageData`、`wx.canvasPutImageData`。
  （注意：这是小程序式 canvas 上下文，需 `ctx.draw()`；标准 Web Canvas 见 33-api-canvas。）

## networking 网络
### `wx.request(object)` → `RequestTask`
- 参数：`url`(必)、`data`、`header`(默认 content-type application/json，不能设 Referer)、`method`(默认 GET，支持 GET/POST/PUT/DELETE/HEAD)、`dataType`(默认 json，会 JSON.parse)、`responseType`(默认 text，支持 arraybuffer)、`success`/`fail`/`complete`。
- success 回 `{data, statusCode, header, cookies, errMsg:"request:ok"}`。
- **RequestTask**：`abort()`、`onHeadersReceived`/`offHeadersReceived`、`onChunkReceived`/`offChunkReceived`(分块接收)。
### `wx.connectSocket(object)` / `wx.createSocket(object)` → `SocketTask`
- 参数 `url`(ws/wss)、`header`。**SocketTask**：`send({data})`(String/ArrayBuffer)、`close()`、`onOpen`/`onClose`/`onError`/`onMessage`(回调 data)。
### `wx.createEventSource(object)` → `EventSourceTask`（SSE，参数 `url`）。
