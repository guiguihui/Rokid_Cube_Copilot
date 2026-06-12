# 06 · 调试

源：`docs/aiui/0-guide/debug/*`

- 开发阶段推荐 **AIUI DevTools**（类 Chrome DevTools 体验）。
- **CDP + Chrome DevTools**：底层引擎支持 Chrome DevTools Protocol，可用 Chrome 连真机/模拟器：
  1. 终端启动 `aiui run --debug`
  2. Chrome 打开 `chrome://inspect`
  3. 配置端口映射 → 断点调试、查看 Network/Console。
- **Source map**：AIUI 编译器自动生成，DevTools 中可见未混淆原始代码，便于定位报错行号。
