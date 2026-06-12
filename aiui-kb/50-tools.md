# 50 · 开发者工具

源：`docs/aiui/5-tools/*`

> 四类：工具链总览(intro) / CLI / Craft 工作台 / 真机调试。覆盖 本地开发→页面验证→设备联调。

---

## CLI — `aiui`
- `aiui --help`：帮助
- `aiui open <path>`：打开/预览指定路径的 AIUI 项目
- `aiui pack`：打包当前项目为可分发产物
- `aiui --version`：版本
- （另：脚手架 `npm create @yodaos-pkg/aiui-agent <name>`；打包 AIX 用 `aix` CLI，见 07-guide-bundle；调试 `aiui run --debug` 见 06-guide-debug。）

## Craft — 一体化 Web 工作台（面向 AIUI/Ink 工程）
- 能力：导入工程 / 文件浏览(左侧文件树) / 代码编辑(与本地同步) / 实时预览。
- 场景：页面调试(查 title/description/Schema/入口)、参数验证(运行配置面板选页测参数)、项目巡检、联动开发(改码即看预览)。
- 关系：AIUI(开发模型) + Ink(运行渲染) + Craft(导入/编辑/发现/预览的工作台入口)；不替代框架/运行时。需打包/发布/自动化时切到 CLI。

## 真机调试 — 验证真实体验的关键
- 场景：交互验证(语音/手势/按键)、性能观察(启动/卡顿/内存/功耗)、能力联调(网络/存储/音频)。
- 建议：以真机为最终判断依据；结合日志+远程调试定位；关键流反复验证弱网/蓝牙链路/连续操作。
