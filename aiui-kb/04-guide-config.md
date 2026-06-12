# 04 · 配置（AGENTS.md / app.json / page.json）

源：`docs/aiui/0-guide/config/*`

> 阅读顺序：AGENTS.md（智能体整体）→ 全局配置 app.json → 页面配置 page.json。

---

## AGENTS.md — 智能体描述规范
类似 `package.json`/`manifest.json`，但侧重 AI/智能体特性。声明 agent 配置、能力、系统指令。核心部分：
1. **基础信息**：`# Agent: 名称` + Version / Description / Author
2. **系统指令(System Prompts)**：核心行为准则/性格/基础指令（LLM 运行时最重要上下文）
3. **能力声明(Capabilities)**：如 `fs.read` / `fs.write` / `network.http`
4. **配置(Configuration)**：环境变量，如 `API_ENDPOINT` / `THEME`
5. **依赖(Dependencies)**：依赖的模型/服务/子智能体
- 建议：System Prompts 具体明确；Capabilities **最小权限原则**；维护 Version；严格 Markdown 格式便于机器解析。

---

## app.json — 全局配置
```json
{
  "pages": ["pages/index/index", "pages/logs/logs"],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "AIUI Agent",
    "navigationBarTextStyle": "black"
  }
}
```
- `pages`：页面路径数组，**第一个 = 启动入口页**。
- `window`：全局窗口样式。
- 每个项目还需 `AGENTS.md` 声明元数据/系统指令/能力权限。

---

## page.json — 页面配置（两种写法取决于页面组织形式）

### 多文件结构 → 用独立 `page.json`
作用：覆盖全局窗口配置（如标题）+ 定义页面功能描述与入参结构。
常见字段：`navigationBarTitleText`、`description`（页面能做什么）、`schema.data`（JSON Schema 入参）。
```json
{
  "navigationBarTitleText": "天气查询",
  "description": "查询指定城市的天气信息",
  "schema": { "data": { "type":"object",
    "properties":{ "city":{ "type":"string", "description":"城市名称，例如杭州" } },
    "required":["city"] }}
}
```

### `.ink` 单文件 → 配置直接写在 `<script def>` 块
```html
<script def>
{ "navigationBarTitleText":"斗地主", "description":"...",
  "schema":{ "data":{ "type":"object", "properties":{ "roomId":{"type":"string"} } }}}
<\/script>
```
应用入口仍由 `app.json` 的 `pages` 声明。

**理解**：`app.json` 决定从哪个页面开始；页面配置决定当前页怎么展示/描述/接受什么参数。
**选择**：多文件(`index.js+wxml+wxss`)→`page.json`；`.ink` 单文件→页面文件内 `<script def>`。
