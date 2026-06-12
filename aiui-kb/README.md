# Rokid AIUI 文档知识库（自建）

> 来源：https://js.rokid.com （Vite SPA，正文内联在打包 JS 中）。
> 本 KB 是 Claude 为自己查阅而建的**提炼式**笔记，不是逐字复制：每条记录 = 概念提炼 + 关键代码/API 原样保留 + 注意点（⚠️）。

## 这个 KB 怎么用 / 怎么继续构建（给未来的我）

文档正文不在 HTML 里，而是内联在打包 JS 的模板字符串/字符串变量中。提取流程：

1. JS bundle 已下载到 `C:\Users\hhzheng\AppData\Local\Temp\rokid.js`（bash 路径 `/tmp/rokid.js`）。
   - 若文件丢失：`curl -sL https://js.rokid.com/assets/index-uQRmtBVE.js -o /tmp/rokid.js`
     （注意 bundle 文件名带 hash，可能更新；先 `curl -sL https://js.rokid.com/AIUI/guide/quickstart-intro | grep assets/index` 找最新名）
2. 路径→变量名映射：`/tmp/docmap.txt`（142 条，格式 `docs/aiui/...md 变量名`）。
   重建：`perl -0777 -ne 'while(/"\.\.\/(docs\/aiui\/[^"]+\.md)":([A-Za-z0-9_$]+)/g){print "$1 $2\n"}' /tmp/rokid.js | sort > /tmp/docmap.txt`
3. 提取脚本：`C:\Users\hhzheng\AppData\Local\Temp\ex.js`（node，能处理 `var="..."` 和 `` var=`...` `` 两种形式）。
   用法：`node C:\Users\hhzheng\AppData\Local\Temp\ex.js <变量名> [<变量名>...]`
4. 进度跟踪：`/tmp/progress.txt`（`[x]` 已读 / `[ ]` 未读）。
5. 读完一批后：把提炼内容追加到对应分区 md，并在 `progress.txt` 标记 `[x]`，更新本文件「进度」。

⚠️ 该 loop 由 cron `*/15 * * * *`（job 见下）驱动，会话内有效。若临时文件丢失按上面重建。

## 分区文件（全部已建）

| 文件 | 对应源路径前缀 | 内容 |
|------|----------------|------|
| `01-guide-quickstart.md` | `0-guide/quickstart/*` + `0-guide/structure.md` | 快速开始、目录结构 |
| `02-guide-basic.md` | `0-guide/basic/*` | 基础能力（AI/设备/网络/存储/canvas/module）|
| `03-guide-framework.md` | `0-guide/framework/*` | 框架机制（逻辑层/视图层/分类）|
| `04-guide-config.md` | `0-guide/config/*` | 配置（AGENTS.md/app.json/page.json）|
| `05-guide-runtime.md` | `0-guide/runtime/*` | 运行时（env/js-QuickJS/mechanism）|
| `06-guide-debug.md` | `0-guide/debug/*` | 调试（CDP/sourcemap）|
| `07-guide-bundle.md` | `0-guide/bundle/*` | 打包/发布（AIX/aix-cli/灵珠平台）|
| `08-guide-performance.md` | `0-guide/performance/*` | 性能（startup/runtime/tool）|
| `09-guide-open-agent-format.md` | `0-guide/open-agent-format/*` | OAF + 页面定义/生命周期/事件 |
| `10-guide-misc.md` | `0-guide/custom-components.md` | 自定义组件 |
| `11-framework-wxml.md` | `1-framework/wxml/*` | WXML（绑定/条件/列表/模板）|
| `12-framework-wxss.md` | `1-framework/wxss/*` | WXSS（选择器/伪类/属性/函数/@规则）|
| `13-framework-config.md` | `1-framework/config/*` + `structure/*` | framework 结构 & 配置 |
| `20-components.md` | `2-components/*` | 组件库（17 个组件）|
| `30-api-ai.md` | `3-api/ai*` | API · AI（LanguageModel/ASR/TTS）|
| `31-api-core.md` | `3-api/framework,console,crypto,encoding,performance,route,speech` | API · 框架 & 核心全局 |
| `32-api-device.md` | `3-api/device*` | API · 设备 & 传感器 & 条码 |
| `33-api-canvas.md` | `3-api/canvas/*` | API · Canvas(2D, Web 标准) |
| `34-api-media.md` | `3-api/media*` | API · 多媒体（Sound/AudioPlayer/相机/录音）|
| `35-api-network.md` | `3-api/network*` | API · 网络（HTTPS/SSE/WebSocket/URL）|
| `36-api-storage-web-open.md` | `3-api/storage*,web-apis,open-services` | API · 存储/Web总览/开放服务 |
| `37-api-wx-compatible.md` | `3-api/weixin-compatible-apis*` | API · 微信小程序兼容（wx.*）|
| `40-design.md` | `4-design/*` | 设计规范（交互/视觉 Design Tokens/资源）|
| `50-tools.md` | `5-tools/*` | 开发者工具（CLI/Craft/真机调试）|
| `60-repo-devtools-skill.md` | GitHub `jsar-project/AIUI`（`E:\ROKIT\AIUI`）| ★**实现真相**：脚手架/示例/aiui-dev Skill；反幻觉清单（API 实现 ≠ 浏览器标准）；skills-lock 机制。**写代码前先查这篇 + skills/aiui-dev/apis-*.md** |

## 进度

- **已读：142/142 ✅ 全部读完**
- 提取工具仍在临时目录（`/tmp/rokid.js`、`docmap.txt`、`progress.txt`、`ex.js`）；如需复读或文档更新后重读，按上面「怎么继续构建」操作。
- ⚠️ 文档若有新版本，bundle 文件名（hash）会变；重抓 HTML 找最新 `/assets/index-*.js` 后重建 docmap 即可。

## 核心概念速记（跨文档）

- **AIUI** = AI-Native User Interface，AI 原生 UI 框架；让 AI 以"界面"而非纯文本与用户协作。两种形态：**对话内交互**（卡片嵌在聊天流）、**沉浸式交互**（独立界面承载完整交互）。
- **三种实现路线**：① Tool Rendering（用 LLM `tools` 注册 UI 能力，高控制低自由度）② MCP Apps（tool 调起独立受控界面，渲染器 `InkView` 在沙箱跑）③ A2UI（声明式 Generative UI，模型输出 commands：`surfaceUpdate`→`dataModelUpdate`→`beginRendering`）。
- **兼容微信小程序**（WXML/WXSS/wx.* API）+ 原生 Web API，目标"一套 Agent 多端部署"（AR 眼镜/手机/桌面）。
- 底层运行时叫 **Ink**，故单文件组件后缀为 `.ink`。
