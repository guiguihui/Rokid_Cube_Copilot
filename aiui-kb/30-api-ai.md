# 30 · API · AI

源：`docs/aiui/3-api/ai*`（与 02-basic 的 AI 部分重叠，这里记 API 细节补充）

---

## LanguageModel（`/ai/language-model`）
- 入口：全局直接用，或 `import { LanguageModel } from 'language-model';`
- 方法 + 返回类型：
  - `availability()` → `Promise<'available' | 'unavailable'>`
  - `create(options?)` → `Promise<LanguageModelSession>`（options: `model`、`initialPrompts:[{role,content}]`、`tools:[{type:'function',function:{name,description,parameters(JSON Schema)}}]`）
  - `session.prompt(input)` → `Promise<string>`
  - `session.promptStreaming(input)` → `LanguageModelTextStream`（轮询 `while(true){const {done,value}=await stream.read(); ...}`）
  - `session.clone()`：复制上下文成独立新会话
  - `session.destroy()`：销毁释放
- ⚠️ `tools` 当前仅向模型**声明**可用函数及参数结构；JS 接口不自动接收结构化 tool call 回调；普通文本/增量仍经 `prompt()`/`promptStreaming()` 暴露。
- 建议：会话=有上下文的交互单元(非全局单例)；长文本用流式；用完 `destroy()`；同会话同时只一个活跃请求；未传 `model` 需环境有默认模型。

## SpeechRecognition（`/ai/speech-recognition`）
- `new SpeechRecognition()`；事件 `onresult`(`event.results[0][0].transcript`/`.confidence`)、`onerror`(`event.error`/`.message`)、`onend`。
- 方法：`start()` / `stop()`(出最终结果) / `abort()`(立即中止)。
- ⚠️ 同实例勿并发多轮。

## 语音播报（`/ai/speech-synthesis`）
- `new SpeechSynthesisUtterance(text)` + `speechSynthesis.speak(utterance, mode?)`
- `mode`：`'enqueue'`(默认,追加队列不打断) / `'immediate'`(立即播放)。
- ⚠️ **当前能力边界**：`lang`/`pitch`/`rate`/`volume`/`voice` 当前**暂未生效**；`cancel()`/`pause()`/`resume()`/`getVoices()` 及 utterance 生命周期事件**未暴露**。（与 02-basic 里列的 lang/rate 等属性矛盾——以此 API 文档的"暂未生效"为准。）
