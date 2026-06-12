# 魔方还原助手 (Cube Coach)

面向新手的魔方还原教练 · AIUI standalone agent（Rokid 单绿 Micro-LED 眼镜）。
输入魔方六面颜色 → 自动求解 → HUD 箭头逐步引导还原。

## 功能
- **输入页**：可编辑「6 面 × 9 格」颜色网格（点格循环切色，中心锁定），合法性校验；**「载入测试打乱」一键体验**。
- **求解**：内置 rubiks-cube-solver（CFOP，MIT）纯本地求解，**table-free、~15ms、零建表**（约 60~70 步）。
- **引导页**：Canvas 画「面字母 + 旋转箭头 + 步数」，语音播报，支持语音「下一步/上一步/重复」与按钮/方向键。

> ⚠️ 不用 Kociemba(cubejs)：其 `initSolver` 需构建百万级剪枝表，在浏览器 rquickjs 运行时会**同步冻结主线程数十秒**（node 约 2s）。已改用免建表的 CFOP 求解器。

## 运行 / 测试（AIUI 工具链）
> 本机未安装 AIUI CLI；请在装有工具链的环境运行。

```bash
# 预览（PC）
aiui open .            # 或用 Craft 网页工作台导入本目录

# 调试（断点 / Console）
aiui run --debug       # 再用 Chrome 打开 chrome://inspect
```

### PC 主路径（不依赖摄像头/语音）
1. 输入页点 **「载入测试打乱」** → 网格填入已知打乱（免手输 54 格）。
2. 点 **「求解」**（毫秒级，无延迟）→ 跳转引导页。
3. 引导页 **Enter / 下一步** 逐步走到「完成」；**Backspace / 上一步** 回退。
4. 校验分支：手动把某格改成非法颜色再「求解」，应高亮报错且不跳转。

## 结构
```
app.json / app.js / AGENTS.md / package.json
lib/cube.js                颜色↔面字母映射 / 校验 / 烘焙测试打乱网格
lib/solver.js              solve(grid) / scrambledGrid / selfTest
lib/moves.js               走步串 → 新手步骤
lib/vendor/cube-solver.js  内置 rubiks-cube-solver（CFOP，已适配 ES 模块）
lib/webp.js, lib/vendor/webpjs/   webp 解码（真机摄像头预填用，暂未启用）
pages/input/index.ink      输入页（入口）
pages/guide/index.ink      引导页
```

## 已验证（node 离线）
`selfTest`（对测试打乱求解，28ms）PASS；求解结果用 cubejs 当裁判**交叉验证 isSolved=true**；颜色映射、校验、走步解析、token 归一化全部 PASS；全部 `.ink`/`.js` 通过语法检查。

## 标准配色（固定，中心锁定）
白顶(U) 黄底(D) 绿前(F) 蓝后(B) 橙左(L) 红右(R)。

## 待迭代（非本次 MVP）
- 摄像头拍照预填充（`lib/colors.js`，真机）：takePhoto → decodeWebP → 9 格 HSV 分类。
- 层先法(LBL)分阶段教学：替换/叠加 `lib/solver.js`，引导页加阶段讲解。
- 提示音资源（`assets/*.wav`）。
