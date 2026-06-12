# 11 · 框架参考 · WXML

源：`docs/aiui/1-framework/wxml/*`（沿用微信小程序 WXML 规范，但控制属性前缀是 `ink:` 而非 `wx:`）

> 动态数据均来自对应 Page 的 `data`。`docs/aiui/1-framework/wxml.md` 是"文档建设中"占位。

---

## 数据绑定（Mustache `{{ }}`）
- 内容：`<view>{{message}}</view>`
- 组件属性（**须在引号内**）：`<view id="item-{{id}}">`
- 控制属性（须在引号内）：`<view ink:if="{{condition}}">`
- 关键字：`checked="{{false}}"` ⚠️ 别写 `checked="false"`（字符串转 boolean 是真值）
- **运算**（`{{}}` 内）：三元 `{{flag?true:false}}`、算数 `{{a+b}}`、逻辑 `{{length>5}}`、字符串 `{{"hello"+name}}`、路径 `{{object.key}} {{array[0]}}`
- **组合**：数组 `{{[zero,1,2,3]}}`；对象 `{{for:a, bar:b}}`；展开 `{{...obj1, ...obj2, e:5}}`；同名简写 `{{foo, bar}}`；同名后者覆盖前者。
- ⚠️ 花括号与引号间有空格会被解析成**字符串**。

---

## 条件渲染
- `ink:if` / `ink:elif` / `ink:else`：
  ```html
  <view ink:if="{{length>5}}">1</view>
  <view ink:elif="{{length>2}}">2</view>
  <view ink:else>3</view>
  ```
- `<block ink:if>`：包装多个组件一次性判断；`<block/>` 不渲染、仅接受控制属性。
- **`ink:if` vs `hidden`**：`ink:if` 惰性+局部渲染(切换时销毁/重建)，切换开销大；`hidden` 始终渲染只控显隐，初始开销大。**频繁切换用 `hidden`，少变用 `ink:if`**。

---

## 列表渲染 `ink:for`
- 默认项变量 `item`、下标 `index`：`<view ink:for="{{array}}">{{index}}: {{item.message}}</view>`
- 自定义名：`ink:for-item="itemName"` / `ink:for-index="idx"`
- 可嵌套；`<block ink:for>` 渲染多节点块。
- **`ink:key`**：项位置变动/增删时保留状态与提升效率。值=array 中 item 的某唯一不可变 property，或保留字 `*this`(item 本身为唯一字符串/数字)。不提供会 warning(静态列表可忽略)。
- ⚠️ `ink:for="array"`（无 `{{}}`）会把字符串拆成字符数组 `['a','r','r','a','y']`。

---

## 模板 template
- 定义：`<template name="msgItem">...</template>`
- 使用：`<template is="msgItem" data="{{...item}}"/>`
- `is` 可用 Mustache 动态选模板：`<template is="{{item%2==0?'even':'odd'}}"/>`
- 作用域：模板有自己的作用域，只能用传入的 `data` 及模板文件内定义的 `<wxs/>` 模块。
