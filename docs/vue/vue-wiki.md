# vue 杂记

## vue 的组成部分

数据响应式，虚拟 dom

## vue 数组为什么不进行 Object.defineProperty

尤大回答： 出于性能考虑，不对数组做 Object.defineProperty

```js
const arr = ['a', 'b', 'c']

let val = arr[0]
Object.defineProperty(arr, '0', {
  get: function () {
    console.log(123)
    return val
  },
  set: function (newVal) {
    val = newVal + 1
  }
})

console.log(arr[0])
arr[0] = 100
console.log(arr[0])
```

## vue 切换只有运行时版本和带编译版本代码

一、使用别名

```js
// vue.config.js
module.exports = {
  // ...
  resolve: {
    alias: {
      vue$: 'vue/dist/vue.esm.js'
    }
  }
}
```

二、使用 vue-cli 配置

```js
// vue.config.js
module.exports = {
  runtimeCompiler: true // 带编译版本
}
```

## vue 中实现 HOC，render props 的方式

1. jsx
2. slots
3. <component v-bind:is="currentTabComponent"></component> 内置组件

## vue 生命周期执行顺序

除了 created ed 结尾的生命周期都是子先。

销毁：

```js
parent beforeDestroy
son beforeDestroy
son destroyed
parent destroyed
```

挂载：

```js
parent beforeCreate
parent created
parent beforeMount
son beforeCreate
son created
son beforeMount
son mounted
parent mounted
```

更新：

```js
parent beforeUpdate
son beforeUpdate
son updated
parent updated
```

总:

```js
// 挂载时
parent beforeCreate
parent created
parent beforeMount
son beforeCreate
son created
son beforeMount
son mounted
son activated   // keep-alive 这里没写错哦，activated 是在 mounted 之后的
parent mounted
parent beforeUpdate
parent update
// 更新时
parent beforeUpdate
son beforeUpdate
son update
parent update
// 销毁时
parent beforeDestroy
son deactivated    // keep-alive 如果父级组件也销毁，keep-alive 组件还是会销毁的。这里没写错哦 deactivated 是在销毁之前的
son beforeDestroy
son destroyed
parent destroyed
```

## 运行时编译和构建时编译

自带编译器版本的 vue ，在运行时自己编译，就是运行时编译。

不带编译器版本的 vue，在打包时，使用 webpack + vue-loader 编译，就是构建时编译。

## vue 对同一个属性短期内多次快速更新

05-observe-arr/同一个函数内对 data 执行两次.html

如果值相同，不会触发更新。数组例外，因为数组的升级版 api 没有对值进行对比，只要使用就会触发 notify。
如果值不同，在同一个 tick 中，不会进行多次渲染。
在真正渲染时会取数据的最新值(异步渲染时，此时 js 中同步多次赋值早已经改变了数据，所以渲染时获取的值是最新的)。

数组不做值对比我感觉是因为几乎没有这样的场景，
如果是基础值，那根本不需要改变数组值，如果是对象，那指针不同，也不需要对比，必须要重新渲染。
只判断对象指针相同，而不是真正的判断对象值相同，应该也是这种原因，收益低，如果对象很复杂，对比更消耗性能。

## what's this

1. diff 算法只比较同层节点，这是因为 dom 的特性，一般而言，我们很少会将父节点移动到子层，也很少会把子节点移动到父层，所以之比较同层节点减少运算。

2. key 的意义，在 diff 中比较 vnode 是否是相同节点

## 文本节点

文本节点，也就是纯文本，也会被创建成文本 vnode。

\_c 中会使用 \_v -> createTextVNode 来生成。

h 函数 会在 normalizeChildren 中调用 createTextVNode 来生成。

vue2 中标签内部的空格，换行会在编译后的 render 中被保留。所以如非必要，去除这些空格换行，可以提升下性能。 vue3 已经做过优化了。

## ast

抽象语法树简称 ast(abstract syntax tree)。使用对象的形式描述树形的代码结构。vue 中的抽象语法树是用来描述树形结构的 html 字符串。

### vue 中为什么使用 ast？

template 转换成 ast 后，可以通过 ast 对 template 做优化处理。通过标记 template 中的静态内容，在 patch 的时候直接跳过静态内容。在 patch 的过程中静态内容不需要对比和重新渲染。

### 编译

在包含编译的版本下，当传入的是 template 时，会去走内部的编译逻辑。通过将 template 转换成 ast 语法树(ast 只是 js 对象)，再转换成字符串形式的 js 代码，最后通过 new Function() 来生成真正的 js 代码，也就是 render 函数。该 render 函数会通过编译时写入的 \_c 来获取 vnode。

所以，当我们手写 render 传入时，通过 h 来调用 createElement 。与编译生成的 render 函数内部使用 \_c 的本质是一样的。都是通过 createElement 来获取 vnode。

所以，vue 编译的实质就是，把 template 变成 一段生成 vnode 的 js 代码。

#### 减少使用空格，换行

如果使用包含编译版本的 vue，则少写没有必要的空白和换行，因为在编译时都会生成 ast 对象，存放在内存中，占用内存资源。

#### 线上打包

这里要注意的是，即便是包含编译版本的 vue。在打包时，也会使用到 vue-loader。

因为 vue-loader 的作用是：

1. 将 Vue 单文件组件转换为 JavaScript 模块。否则 webpack 无法识别 .vue 文件。
2. 将组件代码编译成 render 函数。

我们使用带编译版本的 vue 不是为了解决 vue 单文件组件的问题。而是在 vue 中可能会用到。

```js
new Vue({
  template: 'xxx'
})

Vue.extend({
  template: 'xxx'
})
```

这种情况。

#### 流程自讲

我们在入口文件里通过 compileToFunctions 函数来将 template 转换成 render，compileToFunctions 是一个通过科里化生成的函数，通过父级函数传递 baseOptions，baseCompile 进行参数分离，最终形成了这个函数。

而 compileToFunctions 做的操作其实就两个：一个是通过调用内部的 compile -> 去调用 baseCompile 去进行编译，另一个就是 调用 createFunction -> new Function 去把字符串形式的代码转变成真正的 render 函数。

所以，实际上编译的核心就两点，一个是 baseCompile 函数，一个是 new Function。 new Function 我们不用详谈，这里就简单讲讲 baseCompile。

baseCompile 主要做三件事：

1. 把 template 编译成 ast 对象；
2. 优化 ast 对象，标记静态节点及静态根节点；
3. 将 ast 对象转换成字符串形式的 js 代码。
