# 10 · 其他 guide（自定义组件等）

源：`docs/aiui/0-guide/custom-components.md`

---

## 自定义组件
- 由 `.json` + `.wxml` + `.wxss` + `.js` 四文件组成。
- 声明（`component.json`）：`{ "component": true }`
- 注册（`component.js`）：
  ```javascript
  export default {
    properties: { title: { type:String, value:'Default Title' } },
    data: { internalData: 1 },
    methods: { handleTap(){ this.triggerEvent('customevent', { data:123 }); } }
  }
  ```
- 页面 `.json` 引入：`{ "usingComponents": { "my-component": "/components/my-component/index" } }`
- WXML 使用：`<my-component title="Hello" bind:customevent="onCustomEvent"></my-component>`
- 父子通信：properties 传入，`this.triggerEvent(name, detail)` 向上抛事件，父用 `bind:事件名` 接收。
