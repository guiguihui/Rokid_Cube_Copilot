# 02 · 基础能力

源：`docs/aiui/0-guide/basic/*`

> 基础能力总览：网络、存储、模块化、画布、设备(蓝牙/IMU)、AI(ASR/LLM/TTS)。

---

## AI 能力

完整语音链路：`用户说话 → ASR → 文本 → LLM → 文本 → TTS → 用户听到`。

### LLM — `LanguageModel`（全局类，Web AI 风格 API）
```javascript
const status = await LanguageModel.availability();      // 'available' 等
const session = await LanguageModel.create({
  model: 'gpt-4o-mini',
  initialPrompts: [{ role:'system', content:'请用简洁中文回答。' }],
  tools: [{ type:'function', function:{ name:'get_weather', description:'...',
    parameters:{ type:'object', properties:{ city:{type:'string'} }, required:['city'] } }}],
});
const text = await session.prompt('...');               // 一次性
const stream = session.promptStreaming('...');           // 流式：轮询读
while (true){ const {done,value}=await stream.read(); if(done)break; if(value!==undefined)console.log(value); }
```
- 方法：`availability()` / `create(opts?)` / `prompt(input)` / `promptStreaming(input)` / `clone()` / `destroy()`。
- ⚠️ 会话是「有上下文的交互单元」非全局单例；同一会话同时只跑一个活跃请求；离开页面 `destroy()`；长文本用流式；`initialPrompts` 放系统约束别每轮塞。未传 `model` 则需环境有默认模型。`tools` 当前仅向模型声明函数，回调由运行环境侧处理。

### ASR — `SpeechRecognition`（Web Speech API 风格）
```javascript
const recognition = new SpeechRecognition();
recognition.onresult = (e) => { const best=e.results[0][0]; console.log(best.transcript, best.confidence); };
recognition.onerror  = (e) => console.error(e.error, e.message);
recognition.start();   // 另有 stop()=出最终结果, abort()=立即中止
```

### TTS — `speechSynthesis` + `SpeechSynthesisUtterance`（Web Speech API 风格）
```javascript
const u = new SpeechSynthesisUtterance('欢迎使用 AIUI');
u.lang='zh-CN'; u.rate=1.0; u.pitch=1.0; u.volume=1.0;  // 另有 text/voice
speechSynthesis.speak(u);
```

---

## 网络

- 支持 **`fetch`（推荐，Web 标准）** 与 **`wx.request`（小程序兼容）**。
  ```javascript
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...}) });
  const data = await res.json();
  wx.request({ url, method:'GET', success(res){...}, fail(err){...} });
  ```
- **AI 眼镜联网机制**：眼镜经蓝牙连手机 App(Rokid AI / Hi Rokid) 时走 **移动 App 代理(Mobile Proxy)** — Wi-Fi 未连但 App 在线时，`fetch`/`wx.request` 自动经眼镜↔手机链路转发，对开发者透明；省电(可关眼镜 Wi-Fi 芯片)、便捷(复用手机 4G/5G)。
- ⚠️ 线上强制 HTTPS；发布前域名需在开发者后台**报备(白名单)**；建议设超时。局域网(LAN)直连**开发中**。

---

## 存储（`wx.*` 小程序兼容，JSON 可序列化数据）
- 异步：`wx.setStorage/getStorage/removeStorage/clearStorage`
- 同步：`wx.setStorageSync/getStorageSync/removeStorageSync/clearStorageSync`
```javascript
wx.setStorage({ key:'user_info', data:{...}, success(){}, fail(res){} });
wx.getStorage({ key:'user_info', success(res){ res.data } });
wx.setStorageSync('theme', {mode:'dark'}); const t = wx.getStorageSync('theme'); // key 不存在返回 undefined
```

---

## 模块化（ESM）
- 底层运行时 Ink **原生支持 ESM**，用 `import`/`export`；动态 `import()` 支持代码拆分。
- ⚠️ **`.ink` 文件不支持 export**（只能 import 其他模块），只有 `.js` 能 export。
- ⚠️ **不支持** `module.exports`/`require()`（无 CommonJS）；**不支持顶级 await**；本地引入**必须带后缀**(如 `.js`)。
- 第三方库：不支持从 `node_modules` 导入 npm 包 → 手动下载 ESM 版(`.mjs`)放 `libs/`，相对路径引入。

---

## 画布 Canvas（目前仅 2D）
```html
<canvas canvas-id="myCanvas" style="width:300px;height:150px;"></canvas>
```
```javascript
const ctx = wx.createCanvasContext('myCanvas', this);   // 建议在 onLoad 调用
ctx.setFillStyle('#07c160'); ctx.fillRect(10,10,100,100);
ctx.setStrokeStyle('#fff'); ctx.setLineWidth(2); ctx.strokeRect(30,30,100,100);
ctx.draw();   // ⚠️ 命令先入队，必须调 draw() 才渲染（与标准 Web Canvas 不同）
```
- AR 建议：背景透明(叠现实)、降低 `draw()` 频率、注意 `devicePixelRatio`。
- ⚠️ WebGL / OffscreenCanvas **开发中**；`onUnload` 时停渲染循环/计时器省电。

---

## 设备

### 蓝牙 BLE — `navigator.bluetooth`（Web Bluetooth API 风格）
```javascript
const device = await navigator.bluetooth.requestDevice({
  filters:[{services:['0000180d-...']}], optionalServices:['0000180f-...'] });
const server = await device.gatt.connect();
const service = await server.getPrimaryService('0000180d-...');
const ch = await service.getCharacteristic('00002a37-...');
await ch.startNotifications();
ch.addEventListener('characteristicvaluechanged', ()=> console.log(ch.value));
// 扫描：
const scan = await navigator.bluetooth.scanDevices({ filters:[{services:['heart_rate']}] });
scan.onDeviceFound(e => console.log(e.device.id, e.device.name)); scan.stop();
```
- ⚠️ 操作需界面可交互；区分"不可用/无权限/连接失败"；优先通知而非轮询；离开页面断连。

### IMU 传感器（Generic Sensor API 风格）
| 传感器 | 类 | 读数 |
|--------|----|------|
| 加速度计 | `new Accelerometer({frequency:60})` | `sensor.x/y/z` |
| 陀螺仪 | `new Gyroscope({frequency:60})` | 角速度 `x/y/z` |
| 绝对方向 | `new AbsoluteOrientationSensor({frequency:60})` | `sensor.quaternion`=[x,y,z,w] |
```javascript
const s = new Accelerometer({frequency:60});
s.addEventListener('reading', ()=> console.log(s.x,s.y,s.z));
s.addEventListener('error', e=> console.error(e.error));
s.start();   // 不用时 stop()
```
- ⚠️ 频率 30-60Hz 起按需调高；在 `reading` 事件读值勿轮询；不用即 stop() 省电；DevTools 模拟器返回模拟值需真机验证；绝对方向可用性取决于硬件。
