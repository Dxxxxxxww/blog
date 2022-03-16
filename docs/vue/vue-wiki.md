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

## what's this...
1. diff 算法只比较同层节点，这是因为 dom 的特性，一般而言，我们很少会将父节点移动到子层，也很少会把子节点移动到父层，所以之比较同层节点减少运算。

2. key 的意义，在 diff 中比较 vnode 是否是相同节点