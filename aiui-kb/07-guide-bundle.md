# 07 · 打包与分发（AIX）

源：`docs/aiui/0-guide/bundle/*`

---

## AIX — 什么是 AIX
- **AIX = AI eXecutable**（AI 可执行包），AIUI 定义的标准分发格式。
- 特性：
  - 基于 **OAF(Open Agent Format)** 开放智能体规范。
  - **自包含**：代码(WXML/WXSS/JS) + 配置(JSON) + 静态资源(图片/音频)。
  - **版本追踪**：打包自动生成唯一 UUID 的 `VERSION` 文件，用于版本校验和**热更新**。
  - **资源优化**：PNG/JPEG 无损/有损压缩，JSON 混淆+体积压缩。

---

## aix-cli — 命令行工具
官方 CLI，管理/打包/查看 AIX。
```bash
cargo install --path packages/aix-cli           # 安装（从源码 Cargo）

aix pack <源码目录>                               # 基础打包 → .aix
aix pack <源码目录> -o my-agent.aix               # 指定输出名
aix pack <源码目录> --optimize                    # 开启资源优化
aix pack <源码目录> -O --opt-level 3              # 优化等级 1-3

aix list <AIX文件>        # 不解压查看内容/大小（别名 aix ls）
```
- `.aixignore`（根目录，语法类 `.gitignore`）排除不打包的文件。

---

## publish — 发布到智能体商店（Rokid 灵珠平台）
1. 登录 [灵珠平台](https://rizon.rokid.com/space/home)（需开发者账号/认证）。
2. 应用管理 → 创建应用 → 类型选 **"AIUI 智能体"** → 填名称/图标(方形)/描述。
3. 版本管理 → 上传版本 → 传 `aix pack` 生成的 `.aix`；平台自动校验 `VERSION` 与 `AGENTS.md`。
4. 提交审核（Rokid 审性能/交互规范/安全）→ 通过后上架 Rokid Glasses 商店。
5. 版本更新：改代码 → 重新 `aix pack` → 上传 → 审核；通过后用户设备按 `VERSION` 自动热更新。
