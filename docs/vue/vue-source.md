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

## 自定义合并策略的选项

Vue.config.optionMergeStrategies 默认是一个空对象，它是用户配置的自定义合并策略的选项。它会影响 vue 内部的合并策略。

```js
// mergeOptions 源码核心代码
function mergeField(key) {
  // strats === config.optionMergeStrategies
  // 这里基本上用的就是 defaultStrat 函数了
  // config.optionMergeStrategies 默认是一个空对象，
  // vue 内部会设置 el，propsData，生命周期 的合并策略。ga
  // 它是用户配置的自定义合并策略的选项。
  // https://cn.vuejs.org/v2/api/#optionMergeStrategies
  // defaultStrat，子项属性优先，也就是如果子项属性存在，就取子项。否则取父项
  const strat = strats[key] || defaultStrat
  options[key] = strat(parent[key], child[key], vm, key)
}
```

如果我们有全局使用 Vue.mixin 进行混入，但是又需要做一些条件判断哪些组件不需要混入，就可以使用这个配置，去进行一些自定义的操作。
