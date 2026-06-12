# 35 · API · 网络

源：`docs/aiui/3-api/network*`

> 三类：HTTPS(一次请求一次返回) / SSE(服务端单向持续推送) / WebSocket(双向实时)。
> ⚠️ AI 眼镜上 HTTPS 经蓝牙→手机 App 链路承载（理解弱网/调试结果时需注意）。

---

## HTTPS — `fetch`（普通接口/配置/表单/智能体结果）
```javascript
const res = await fetch('/api/agent/chat', {
  method:'POST', headers:{'content-type':'application/json'},
  body:JSON.stringify({ message:'你好' }) });
const data = await res.json();
```

## SSE — `EventSource`（服务端推送文本增量/进度，单向流式）
```javascript
const es = new EventSource('/api/agent/stream');
es.onmessage = e => console.log(e.data);
es.onerror = () => { es.close(); };
```
- 建议：单向推送优先 SSE 别上 WebSocket；每条消息设计成可独立消费；结束及时 `close()`。

## WebSocket — 双向实时（聊天/协作/实时控制/低延迟）
```javascript
const socket = new WebSocket('wss://example.com/realtime');
socket.addEventListener('open', ()=> socket.send(JSON.stringify({type:'hello',sessionId:'...'})));
socket.addEventListener('message', e => console.log(e.data));
socket.addEventListener('close', ()=>{});
```
- 建议：连接/发送/解析/关闭拆分；消息定稳定格式(`type`/`payload`/`sessionId`)；设计断线重连+心跳；连接成功后再发业务消息；页面销毁主动关闭。
- 不要用 WebSocket：只调普通接口/只要一次结果/只要单向推送 → 用 HTTPS/SSE。

## URL（Web 标准）
- `new URL(url, base?)`：属性 `href`/`origin`(只读)/`protocol`/`username`/`password`/`host`/`hostname`/`port`/`pathname`/`search`/`hash`/`searchParams`；`toString()`/`toJSON()`。
- `URLSearchParams(init?)`(查询串/键值对数组/对象)：`append`/`delete`/`get`(无则 null)/`getAll`/`has`/`set`/`sort`/`toString`。
```javascript
const url = new URL('https://example.com/search');
url.searchParams.set('q','aiui'); url.searchParams.append('page','1');
// url.href => "https://example.com/search?q=aiui&page=1"
```
