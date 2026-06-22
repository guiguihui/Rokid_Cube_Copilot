# 魔方还原助手 (Cube Coach)

面向新手的魔方还原教练 · AIUI standalone agent（Rokid 单绿 Micro-LED 眼镜）。
**摄像头扫描六面 → 自动求解 → HUD 箭头逐步引导还原**，全程可语音操控。

## 功能
- **启动页（进入页）**：开机首屏。图示**怎么握**魔方（白朝上·绿朝前 → 红右 橙左 蓝后 黄底）+ **怎么拍**总则；同时**预热求解器**（建 min2phase 剪枝表）；就绪后**单击 / 语音「进入」**进首页（之后求解秒出）。
- **首页（输入页）**：可编辑「6 面 × 9 格」颜色网格（点格 / 方向键+确认 循环切色，**中心格锁定且导航跳过**），合法性校验；「**扫描魔方**」「**载入测试打乱**」「**重置**」「**求解**」四个按钮；扫描结果回填后逐格核对修正再求解。
- **扫描页（摄像头）**：逐面提示**唯一正确朝向**（顶=白对镜头·蓝边朝上、底=黄对镜头·绿边朝上、四侧=对镜头·白色在上 —— 行优先采样无镜像 + facelet 直拼，朝向错会"颜色对但无法还原"）；`takePhoto` → webp 解码 → **局部精修定位**（`locateCubeLocal`，自测试调优 IoU≈0.86）→ 9 格采样判色（圆周色相 + 红/橙同面细分）→ **复核（所见即所得，可手动改色，确认即置信度 100%）** → 接受进下一面，六面拍完写入 storage 回首页。
- **求解**：内置 **min2phase**（Kociemba 两阶段近最优解，约 20 步）。剪枝表由启动页预热一次性构建（端侧约 1–4s），之后即时响应。
- **引导页**：Canvas 画「面字母 + 旋转箭头 + 步数」，语音播报，逐步「下一步 / 上一步 / 重复」；每步提示「把要转的那一面转到正对你，然后按指示转动魔方」（顺/逆时针均按正对该面看）。
- **语音操控（唤醒词）**：每页说「**乐奇**」唤醒后即可说命令（启动页：进入；首页：扫描 / 打乱 / 重置 / 求解；扫描页：拍照 / 接受 / 重拍 / 上一面 / 退出；引导页：下一步 / 上一步 / 重复 / 返回）。

> ⚠️ **求解器选型**：不用 cubejs(Kociemba) 的运行时 `initSolver` —— 它在浏览器 rquickjs 运行时会**同步冻屏数十秒**；也弃用 CFOP(rubiks-cube-solver, 50–130 步)。改用 min2phase：步数近最优、稳态 <1ms，建表一次性挪到空档完成。

## 硬件约束（Rokid 眼镜 / QuickJS）
- 运行时为 QuickJS：**无 Worker、无 WASM、无 JIT**；不能跑重型同步建表/大表运算（会冻屏）。
- 相机**仅 `takePhoto`**（无视频流），无端侧 ML；判色全靠本地 CV。
- 交互只有：向前 / 向后 / 单击 / 双击 + 唤醒词语音。**双击=系统级返回上一级**（系统自行弹栈，App 不再 `navigateBack`）。
- 语音：系统「乐奇」助手常驻占麦，纯常驻连续听不可行 → 用**唤醒词触发**单次识别（`onVoiceWakeup` → 听一条命令）。

## 结构
```
app.json / app.js / AGENTS.md / package.json
lib/cube.js                颜色↔面字母映射 / 校验 / 烘焙测试打乱网格
lib/solver.js              solve(grid)=min2phase / scrambledGrid / warmup 预热
lib/vendor/min2phase.js    Kociemba 两阶段求解器（cs0x7f/cstimer 源）
lib/moves.js               走步串 → 新手步骤文案
lib/colors.js              locateCubeLocal 定位 / sampleFace 采样 / classifyByAnchorsHue 判色 / refineRedOrange 红橙细分
lib/webp.js, lib/vendor/webpjs/   webp 解码（typed-array 优化，真机摄像头帧用）
lib/png.js / lib/jpeg.js   PNG / JPEG 解码（测试图片兜底）
lib/voice.js               唤醒词语音命令控制器（onVoiceWakeup → 单次识别 → 命中短语执行）
pages/entry/index.ink      启动页（握法/拍摄说明 + 预热求解器 + 单击进入；app.json 首项=入口）
pages/input/index.ink      首页 / 输入页
pages/scan/index.ink       扫描页（摄像头采集 + 判色复核）
pages/guide/index.ink      引导页（HUD 分步动画）
docs/                      产品设计 / 硬件与 API 参考 / 真机自动化测试流程 等
```

## 标准配色（固定，中心锁定）
白顶(U) 黄底(D) 绿前(F) 蓝后(B) 橙左(L) 红右(R)。

## 运行 / 调试
真机部署与自动化测试流程见 `docs/真机自动化测试流程.md`（adb push 到 runtime 目录 + keyevent 驱动 + logcat 观测）。
PC 预览可用 AIUI CLI / Craft 网页工作台导入本目录。

### PC 主路径（不依赖摄像头/语音）
1. 启动页等「✓ 准备就绪」后 **单击进入** 首页（求解器已预热）。
2. 首页点 **「载入测试打乱」** → 网格填入已知打乱（免手输 54 格）。
3. 点 **「求解」**（已预热，秒出）→ 跳转引导页。
4. 引导页 **下一步** 逐步走到「完成」；**上一步** 回退。
5. 校验分支：手动把某格改成非法颜色再「求解」，应高亮报错且不跳转。

## 已验证
`selfTest`（对测试打乱求解）PASS；min2phase 解经裁判交叉验证 `isSolved=true`；颜色映射、校验、走步解析全部 PASS；定位算法在标注帧上 IoU≈0.86（95% ≥0.7）；webp 解码 typed-array 优化后真机提速约 33%；全部 `.ink`/`.js` 通过语法检查。

## 待迭代
- 同色面（多面同中心色）消歧。
- 语音稳定性：系统「乐奇」助手占麦，唤醒后单次识别偶被系统会话 `abort`（连说唤醒会自我打断）；待加"识别中忽略重复唤醒"保护。
- 层先法(LBL)分阶段教学（替换/叠加 `lib/solver.js` + 引导页阶段讲解）。
