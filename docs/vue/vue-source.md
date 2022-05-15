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

## 带着问题去调试

### 1. 组件真实 dom 是怎么挂载的？

在占位 vnode 的 init 钩子函数中，创建完组件实例后，通过 insert 挂载。

### 2. 组件占位 vnode 是在哪个环节去除的？

组件占位 vnode 不会挂载到页面上的，所以不存在去除的问题。

### 3. slots

### 4. keep-alive

### 5. 占位 vnode 与真实 vnode 的父子关系什么时候建立的？

首先要知道，占位 vnode 是在父级组件 render 时，在 \_createElement 中通过 createComponent 创建的。
在 patch 时，占位 vnode 在 createElm 中通过 createComponent 执行 hook.init 创建组件实例时，会将占位 vnode 作为 options.\_parentVnode 传入。
**最后会在 mount 中调用 \_render 生成组件真实 vnode 后建立父子关系(在调用 \_update 之前)**。

首先，会在 \_init 函数中调用 initInternalComponent，会给 vm.$options 上挂载 _parentVnode 占位 vnode。
然后，
这里其实 vue 有个冗余的操作，在组件实例化时(在 initRender 中)，会给组件实例挂载占位 vnode 属性。 vm.$vnode = vm.$options.\_parentVnode。
而在 mount 调用 \_render 时，又会执行 vm.$vnode = vm.$options.\_parentVnode 。在前后两个时间节点中对同一个属性，用同一个值赋值了两次。

### 6. 组件的 mounted 是在什么时候触发的？

在 patch 末尾，invokeInsertHook 中触发组件的 insert 钩子函数，在 insert 中触发。组件的 insert 钩子函数是在 patch/createComponent 中推入 insert 队列中的。

### 7. 生命周期钩子函数是怎么变成数组的？

### 8. 简述 mergeOptions 选项合并策略

### 9. debugger 一下 组件 destroy

### 生命周期执行的位置

- beforeCreate 和 created，都在 this.\_init 实例方法中触发。
- beforeMount 和 mounted
  - 对于根实例来说，都是在 mountComponent 函数中执行。
  - 对于组件来说，beforeMount 在 mountComponent 函数中执行。mounted 在组件占位 vnode insert 钩子函数中执行。
- beforeUpdate 和 updated。
  - beforeUpdate 在实例化 render watcher 时封装进 before 函数，在 flushSchedulerQueue 中调用 before 函数。
  - updated 在 flushSchedulerQueue 方法，在这个方法中会调用一个 callUpdatedHooks 方法，会去调用 updated 钩子。
- beforeDestroy 和 destroyed，都在 vm.$destroy 实例方法中触发。在 patch 中，为了移除老节点，调用 removeVnodes 时，会去调用 invokeDestroyHook 函数。invokeDestroyHook 会去调用组件占位 vnode 的 destroy 钩子，destroy 钩子会去执行组件实例的 $destroy 方法。
- activated 和 deactivated

### 完整描述一下 父子组件生命周期执行流程

1. 初始化阶段的流程 完成
2. 更新阶段的流程
3. 销毁阶段的流程

## vue 父子组件创建的先后顺序

vnode 创建顺序：

1. 子 vnode 先创建。
2. 父 vnode 后创建。

因为是 render 函数的子节点参数 \_c 调用，会先创建。

---

dom 元素创建顺序：

1. 父 dom 先创建。
2. 子 dom 后创建。

在 patch/createElm 中，不管父节点是 dom 还是组件，在这里都会是 dom 标签，所以会创建自身 vnode 的 dom 元素。然后执行 createChildren 遍历创建子级的 dom 并执行 挂载。
最后 父 dom 执行 insert 挂载。

---

挂载顺序：

1. 子先挂载到父上。
2. 父再往上挂载。

### vm，占位 vnode，真实 vnode 的关系

组件使用的地方，也就是占位 vnode ，他只会出现在 templat 和 vnode 树中，而不会出现在真正的 dom 里。

占位 vnode 的 componentInstance 属性就是组件实例。

vm.\_vnode 指向真实 vnode

vm.$vnode 指向占位 node  vm.$options.\_parentVnode 是占位 vnode

真实 vnode 的 parent 是 占位 vnode

### 如果组件传入了 $el 挂载会怎么样？ debugger


