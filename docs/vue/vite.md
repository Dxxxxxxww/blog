# vite

## ES Module

- 现代浏览器都已经支持 ES Module 语法(IE 不算现代浏览器)。
  - 通过 `<script type="module" src="xxx"></script>` 这种方式来加载模块。
- 标记为 `module` 的模块标签，默认延迟加载。
  - 类似于 `script` 标签设置 `defer`
  - 在文档解析完成后，触发 `DOMContentLoaded` 事件前执行

::: tip

这里其实也透露了一点，在 `dom` 树解析完成后，`DOMContentLoaded` 调用之前，已经可以获取到 `dom` 元素了。

`DOMContentLoaded`: `dom` 树构建完成就触发。

`onload`: 所有资源加载完才触发。

:::

## vite vs vue-cli

`vite` 在开发模式下不需要打包可以直接运行（依赖于 esm）。

`vue-cli` 开发模式下必须对项目打包才可以运行。

`vite` 在生产环境下使用 `rollup` 打包。 `rollup` 基于 `esm` 的方式打包。不需要使用 `babel` 将 `import` 转为 `require`，以及其他一些辅助函数，因此模块体积更小。

`vue-cli` 在生产环境下使用 `webpack` 打包。

## vite 特点

1. 快速冷启动：不需要打包；
2. 按需编译：代码在需要加载的时候才会编译，不需要在开启开发服务的时候，等待整个项目打包；
3. 模块热更新：不管模块多少，`HMR` 速度都会很快。

## vite 创建项目

1. vite 直接创建项目

```shell
npm init vite-app <project-name>
cd <project-name>
npm install
npm run dev
```

2. 基于模板创建项目

```shell
npm init vite-app --template react
npm init vite-app --template preact
```

## vite 工作原理

**`vite` 使用浏览器支持的 `esm` 方式来加载模块，它不会打包项目，而是把所有模块请求，都交给开发服务器处理。在服务器端处理浏览器不能识别的模块。**

当 `vite` 的开发服务器收到 `*.vue` 单文件组件的请求，使用 `compiler-sfc` 将单文件组件解析，编译为 `js` 文件。并把响应头中的 `Content-Type` 设置成 `application/javascript`。例如：

```js
// 请求 App.vue。App.vue 会变成如下文件:
// ...
const __script = {
    name: 'App',
    components: {
        HelloWorld
    }
}
// 注意这个请求，这里会去请求被转成 render 函数的 App 组件
import { render as __render } from "/src/App.vue?type=template"
// ...

// 请求 App.vue?type=template，这里是 template 被编译成 render 函数后的组件代码

import { createVNode as _createVNode } from "vue" // ...  

// 提升静态节点
const _hoisted_1 = _createVNode("div", {}) // ...

// 组件 render 函数
export function render(_ctx, _cache, $props, $setup, $data, $options) {
//  ...
}

```
