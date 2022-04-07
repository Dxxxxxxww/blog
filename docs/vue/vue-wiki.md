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

1. 使用别名

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

2. 使用 vue-cli 配置

```js
// vue.config.js
module.exports = {
  runtimeCompiler: true // 带编译版本
}
```

## vue 中实现 HOC 的三种方式

1. jsx
2. slots
3. <component v-bind:is="currentTabComponent"></component> 内置组件

## vue 声明周期执行顺序

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
son create
son beforeMount
son mounted
parent mounted
parent beforeUpdate
son beforeUpdate
son updated
parent updated
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

## what's this...

1. diff 算法只比较同层节点，这是因为 dom 的特性，一般而言，我们很少会将父节点移动到子层，也很少会把子节点移动到父层，所以之比较同层节点减少运算。

2. key 的意义，在 diff 中比较 vnode 是否是相同节点

## 文本节点

文本节点，也就是纯文本，也会被创建成文本 vnode。

\_c 中会使用 \_v -> createTextVNode 来生成。

h 函数 会在 normalizeChildren 中调用 createTextVNode 来生成。

vue2 中标签内部的空格，换行会在编译后的 render 中被保留。所以如非必要，去除这些空格换行，可以提升下性能。 vue3 已经做过优化了。
