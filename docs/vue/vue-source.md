# 学习源码给我带来了什么？

## 重置 data 属性

```js
// $options 上的 data 函数只在初始化时挂载，并执行获取 data，
// 后续 data 的变化并不会改变 data 函数，所以可以通过此方法来重置 data 状态。
Object.assign(this.$data, this.$options.data())
```

## vue-loader

通过编译那块，算是明白了 vue-loader 的重要性以及作用。

## nextTick

nextTick 降级代码处理方式。

## 属性访问优化

每次对属性进行访问，都会去走到内部的 getter 。所以多次访问前，可以先缓存下。
