# Vue3.x

## 与 2.x 对比改变了哪些？

1. 性能；
   1. 使用 proxy 重写了响应式的代码，proxy 性能本身就比 Object.defineProperty 要好；
   2. 对编译器做了优化；
   3. 重写了 virtual dom，让 render 和 update 的性能有了大幅提升；
   4. 服务端渲染的性能也提升了 2-3 倍；
   5. 源码体积优化，更好的 tree-shaking 支持。
2. 源码组织方式改变，使用 ts 重写，采用 [monorepo](https://wangtunan.github.io/blog/vueNextAnalysis/monorepo/) 管理项目结构；
3. composition api;
   1. [官方 rfc 仓库](https://github.com/vuejs/rfcs);
   2. [composition api rfc 文档](https://composition-api.vuejs.org);
4. vite。

### 响应式系统升级

使用 proxy 对象后，v3 可以在初始化时，就可以做到：

1. 监听动态新增的属性；
2. 监听删除的属性；
3. 监听数组的索引和 length 属性；

这几点在 v2 中是需要通过 $set, $delete, 魔改数组 api 才能做到的。

### 编译优化

[v3 模板编译](https://template-explorer.vuejs.org/#eyJzcmMiOiI8ZGl2PkhlbGxvIFdvcmxkPC9kaXY+Iiwic3NyIjpmYWxzZSwib3B0aW9ucyI6e319)

v2 中通过标记静态根节点，优化 diff 过程(静态节点还需要参与 diff)。

而 v3 中标记和提升所有静态节点以及静态根节点，提升到 render 函数外(闭包)，这样只需要在初始化的时候创建一次，而在 diff 的时候只需要对比动态节点内容。

在 v2 里，重新渲染的时候需要重新创建新旧 vnode(虽然 template 编译成 render 函数只会被编译一次并缓存)，diff 的时候，只会跳过静态根节点，对比剩下的每一个新旧 vnode，哪怕这个节点什么都没有改变。

而 v3 中新增了 patchFlag，会标记标签里的动态内容，比如说插值表达式内容，bind 属性，使用 patchFlag 标记后，在 diff 的时候只会检查动态的内容是否发生变化，提高 vdom diff 的性能。

v3 中还新增了事件缓存，如下代码，v3 会将 handleClick 用箭头函数包裹一层，并存到 cache 缓存中，这样就可以避免函数如果是从 data/props 中返回的情况下，引用类型变化(生成了一个新的函数，但是函数功能一模一样)，导致重新渲染。而缓存之后，包裹层是一直不变的，即便函数真的变化了，在调用时通过 \_ctx.handleClick 也能获取到最新的函数。

```html
<div @click="handleClick"></div>

<!-- v3 编译后 -->
<!-- 伪代码 -->
_createVNode( 'div', { onClick: _cache[1] || ( _cache[1] = (...args) =>
(_ctx.handleClick(...args) ) ) })
```

v3 中对内置组件，内置指令等是按需引用的，比如说如果组件中没有使用到 <transition></transition>，则是不会 import 进来，打包进来。

### 源码体积优化

v3 中移除了一些不常用的 api。

1. inline-template;
2. filter。

v3 对 tree-shaking 支持更好，tree-shaking 依赖 esm。内置的组件，指令等如果没有使用是不会被打包的。

### 其他

v3 中可以不写唯一的根节点，是因为模板编译后，会自动生成一个 Fragment 作为根节点。

## vue3 构建版本

v3 不再打包 umd 模式。只打包 cmj，esm，自执行函数三种模式。

cmj:
都是完整版 vue （包含编译器）

1. vue.cjs.js，没压缩
2. vue.cjs.prod.js，压缩过的线上版本。

global:
都是完整版 vue （包含编译器）

1. vue.global.js
2. vue.global.prod.js

只包含运行时 vue

1. vue.runtime.global.js
2. vue.runtime.global.prod.js

browser:

浏览器支持的模块方式， <script type="module"></script>

1. vue.esm-browser.js
2. vue.esm-browser.prod.js
3. vue.runtime.esm-browser.js
4. vue.runtime.esm-browser.prod.js

bundler:

没有打包所有的代码，需要配合打包工具来使用。内部通过 import 导入了 runtime-core

1. vue.esm-bundler.js，包含编译器，内部还导入了 compiler-core。这个版本就是脚手架默认导入的版本，只包含运行时，vue 体积最小的版本。
2. vue.runtime.esm-bundler.js

## v3 新 api

`ref` 传入基本类型的值，是响应式的主要是因为，内部创建了一个 `{ value: xx }` 的对象，并使用 proxy 响应式处理后返回。如果 `ref` 传入引用类型的值，内部会去调用 `reactive`。

`toRef`，`toRefs`，搭配 `reactive`，`props` 使用。当我们在一个自定义 hook 中使用 `reactive` 响应式处理了一个对象，又想在 `setup` 中直接通过结构获取属性，就可以使用这两个 `api`。

### 生命周期钩子

`renderTracked` 与 `renderTriggered` 的区别：`renderTracked` 在首次渲染也会触发。
