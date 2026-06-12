# 36 · API · 存储 / Web 标准总览 / 开放服务

源：`docs/aiui/3-api/storage*` + `web-apis` + `open-services`

---

## 存储（Web Storage）— `localStorage`
- 方法：`getItem(key)`→String|null、`setItem(key,value)`、`removeItem(key)`、`clear()`。无过期时间。
- ⚠️ value 必须字符串（其他类型自动转字符串）；存对象先 `JSON.stringify()`。
- ⚠️ **按智能体(Agent)隔离**，不同 agent 互不可访问。
- 另有 `sessionStorage`（storage-api 文档提及，会话级）。
```javascript
localStorage.setItem('userInfo', JSON.stringify({id:1,name:'Admin'}));
const u = JSON.parse(localStorage.getItem('userInfo'));
```
（小程序兼容的 `wx.setStorage` 系列见 37-api-wx-compatible / 02-basic。）

---

## Web API 总览（web-apis）
- AIUI 底层支持 **WinterCG** 的 **Minimum Common Web API**：`fetch`、`URL`、`TextEncoder/Decoder`、`Web Crypto` 等通用 Web API 可用，大量 npm 包/Web 代码可无缝运行。
- 能力按业务分类分布：Canvas/媒体/AI/设备/网络/编码/加密/存储/console/性能（见各 API 文档）。
- 设计理念：标准优先(WHATWG/W3C)、空间化适配(保持签名同时处理 3D 坐标/深度)、C++ 优化高性能低延迟。

---

## 开放服务（open-services）— `createOpenAPI`
- 调用 Rokid 云平台开放服务增强能力。
- `import { createOpenAPI } from 'open'`；`createOpenAPI()` → Promise，resolve 得含各开放服务接口的对象。
```javascript
import { createOpenAPI } from 'open';
createOpenAPI().then(openapi => { /* 调用云端服务 */ }).catch(err => {});
```
