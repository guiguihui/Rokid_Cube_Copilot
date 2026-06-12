# 32 · API · 设备 & 传感器

源：`docs/aiui/3-api/device*`

> 蓝牙 + 三类 IMU 传感器(Generic Sensor 风格) + 条码检测。

---

## 蓝牙 — `navigator.bluetooth`（Web Bluetooth）
- `getAvailability()`：环境是否可用蓝牙。
- `getDevices()`：已记住的设备列表。
- `requestDevice(options?)` → `BluetoothDevice`（用户选设备）。
- `scanDevices(options?)` → `BluetoothScan`（持续扫描）。
- 连接流程：`device.gatt.connect()` → `server.getPrimaryService(uuid)` → `service.getCharacteristic(uuid)` → `characteristic.startNotifications()` + `addEventListener('characteristicvaluechanged', ...)`(读 `characteristic.value`)。
- 扫描：`scan.onDeviceFound(e => e.device.id/.name)`；`scan.stop()`。
- ⚠️ 启动新能力需 `InkView` 可交互；区分"不可用/无权限/连接失败"。

---

## 传感器（通用模式：`new XXX({frequency:60})`，事件 `activate`/`reading`/`error`，方法 `start()`/`stop()`）
通用属性：`timestamp`(number|null)、`activated`(boolean)、`hasReading`(boolean)；首个有效读数前各轴为 `null`。

| 传感器 | 类 | 读数属性 |
|--------|----|----------|
| 加速度计 | `Accelerometer` | `x`/`y`/`z`（number\|null，加速度）|
| 陀螺仪 | `Gyroscope` | `x`/`y`/`z`（角速度）|
| 绝对方向 | `AbsoluteOrientationSensor` | `quaternion`=`[x,y,z,w]`（number[]\|null）|

```javascript
const s = new Accelerometer({frequency:60});
s.addEventListener('reading', ()=> console.log(s.x, s.y, s.z, s.timestamp));
s.start();  // 用完 s.stop()
```
- 选择：移动/晃动→加速度计；旋转速度→陀螺仪；空间朝向/姿态→绝对方向。
- ⚠️ 四元数勿假设可直接得欧拉角/真北；绑 UI 要控更新频率防抖动；`reading` 事件里读值勿轮询。

---

## 条码 — `BarcodeDetector`（Web Barcode Detection API）
- `new BarcodeDetector({ formats:['qr_code','code_128'] })`（formats 可选提示）。
- 静态 `BarcodeDetector.getSupportedFormats()` → `Promise<string[]>`。
- `detector.detect(imageSource)` → `Promise<barcode[]>`，每项：`boundingBox`(DOMRectReadOnly)、`cornerPoints`([{x,y}×4])、`format`、`rawValue`(解码字符串)。
- ⚠️ **图像源当前仅支持 `ImageData`**（Blob/ImageBitmap/OffscreenCanvas/VideoFrame 及 HTML*Element 均不支持）。典型：从 canvas `ctx.getImageData(...)` 取。
- 支持格式：`aztec`/`code_128`/`code_39`/`code_93`/`codabar`/`data_matrix`/`ean_13`/`ean_8`/`itf`/`pdf417`/`qr_code`/`upc_a`/`upc_e`/`unknown`。
