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

在组件占位 vnode 的 init 钩子函数中，创建完组件实例后，通过 insert 挂载。

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

在 \_init 中 mergeOptions 中， mergeHook 策略合并成了数组。

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
2. 更新阶段的流程 完成
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

vm.\_vnode 指向真实 vnode(在 \_upade 中绑定，在 patch 前)

vm.$vnode 指向占位 node  vm.$options.\_parentVnode 是占位 vnode

真实 vnode 的 parent 是 占位 vnode

### 如果组件传入了 $el 挂载会怎么样？

会多一次 mount 调用，多走一次 mountComponent 的流程。在 \_init 时，由于组件传递了 el，会进行一次 mount 操作。此时的 vm.$el 就是 $el。这时候也会给 vm 上添加 \_vnode 真实 vnode。
页面上 el 对应的 dom 会被 patch remove 掉，这时候组件会先被挂载到 el 对应的地方。

在第二次 mount 的时候，这时候是 create-component init 钩子中的 mount，此时给 el 传递 undefined。在 mountComponent 时，由于传入的 el 是 undefined，vm.$el 就会被赋值成 undefined。

并且由于第一次已经产生了 \_vnode ,所以这次会走到 update 流程。

但是由于第一次产生的 vnode 和这次的 vnode 只是引用地址不同，值其实是相同的 vnode，所以这次 diff 流程最终也只会走到子级文本节点相同，啥也没有处理，白白跑了一次 diff。

然后 create-component init 钩子结束，回到 patch/createComponent 函数中，进行 insert，将原本挂载到 $el 地方的 elm，挂载到其父级 dom 下。

最后回到父级 vnode ，随着 父级 vnode.elm 挂载到 dom 上而挂载。

### (自定义)指令的调用时机简述

指令也会有 bind，insert，等等选项钩子。在生成 patch 的函数定义的地方，可以找到 directives 的模块钩子一共有三个：create，update，destroy。这三个模块钩子会在组件执行相应的操作(挂载，更新，销毁)时，触发模块的钩子函数时执行(在 patch 中搜索 cbs 可以找到)，并在模块钩子中去执行我们定义的指令选项钩子函数。

cbs: 模块钩子，data.hook 组件占位 vnode 钩子(snabbdom 钩子)

### keep-alive 的组件真实 vnode.elm 是怎么挂到 keep-alive 占位 vnode 上的

keep-alive 包裹的子组件(以下称 A)

在父级 createChildren 遇到了 keep-alive 占位 vnode，就会去创建 keep-alive 实例。

keep-alive 初始化实例，调用 mount 进入 \_update 后，此时的 vm 实例指向 keep-alive，render 生成的真实 vnode 其实是 A 的占位 vnode 。

通过 patch/createElm 中 createChildren 去创建 A 组件的 dom 元素时。由于 A 此时是一个占位 vnode，所以就会去走 patch/createComponent 流程。createComponent 就会去走调用 (i = init)：

1. 创建 A 真实 vnode。
2. 调用 mount。
   a. 去走 patch，进入 createElm，创建了 dom 并挂载到真实 vnode.elm 上，createElm 结束。patch 返回，将 vnode.elm 返回给 A 组件实例 vm.$el。真实 vnode 流程结束（i 函数调用结束）。回到 A 占位 vnode patch/createComponent 流程中。这时候会在 initComponent 中，通过 vnode.elm = vnode.componentInstance.$el，获取到 vm.$el 并挂载到 A 占位 vnode 上，**这时候真实 vnode 将 elm 传递给占位 vnode 的流程就结束了。**最后 patch/createComponent 结束，返回 true 到 createElm，createElm 结束，返回到 patch，最后又把占位 vnode.elm 返回给 vm.$el 。

所以实际上 vm.$el 经历了两次赋值，一次是真实 vnode 进行赋值，这是为了传递给占位 vnode 用的。第二次赋值对于普通组件确实是多余了，对 keepAlive 正好使用。

A 作为占位 vnode 流程结束，但是又因为 A 占位 vnode 就是 keepAlive 的真实 vnode，所以在 A 占位将 vnode.elm 返回给 keepAlive 实例 vm.$el 上，A 占位 patch 流程结束。回到 keepAlive 作为占位 vnode 的 patch/createComponent 流程中。这个时候，keepAlive 就可以通过调用 initComponent，把 componentInstance.$el 挂载到占位 vnode.elm 上，最后通过 insert 插入到父级 dom 上。

### hydrating 真的会影响挂载吗

### 组件 diff

一、组件 v-if v-else diff 过程，code 在 19-diff-component/index.html。

在父级 div 因为 sameVnode 判断相同，所以通过 patchVnode 进入了 updateChildren 的流程，然后因为节点不匹配，进入了 else 判断分支中，又因为 B 组件在 keyMap 中找不到对应的 index，所以会直接进行 createElm。最后因为 A 组件是在 updateChildren 中命中旧子节点更多的情况，将 A 移除。这里是在父节点的维度，移除了子节点 A。

patchVnode 结束回到 patch 中。由于是 sameVnode 去了 patchVnode 分支，就不会进到 else 里面进行 createElm 和 removeVnodes 操作，直接进行 invokeInsertHook。

明明新旧节点的长度一样，为什么会命中旧子节点更多的情况？

因为进入 updateChildren 的 else 分支，通过遍历 keyMap 去找节点，结束后会将新起始下标右移，导致新节点起始下标超过新节点结束下标。导致命中。

二、组件 component 内置组件的 diff 过程，code 在 19-diff-component/second.html。

流程与上面 1 中相同。

### props 在 diff 的哪个阶段修改

例子在 example/16-component/second.html

当父级组件修改 state 时，触发 dep.notify() 更新，遍历去调用 watcher.update()，将 computed watcher 的 dirty 置为 true，将其他两种 watcher 调用 queueWatcher() 推入 watcher queue。**然后在 nextTick() 中执行**
flushSchedulerQueue()，调用 watcher.run()，执行父级组件的 render watcher。

在父级组件更新过程中，进入 patchVnode，调用了 updateChildren，去进行子级的比较更新，由于 sameVnode 判断新旧 vnode 相同，进入子级的 patchVnode，这时候会去调用子级组件的占位 vnode 的 prepatch 钩子函数。（此时，通过 render 生成的新的子级组件占位 vnode.componentOptions.propsData 中 a 已经是 2 了）

**prepatch 中调用 updateChildComponent，获取到最新的 props 值，更新给子级组件的 props**，这时候又会触发子级组件的派发更新过程，会在下一个 nextTick 中去执行子级的 render watcher（这就是子组件的更新过程）。

#### 为什么 props 变化了 新旧 vnode 依然还是相同 vnode？

这是因为 sameVnode 不会去比对 props。不会去比对深层值的变化。

```js
function sameVnode(a, b) {
  return (
    // key 是否相同
    a.key === b.key &&
    // asyncFactory：异步组件工厂函数
    a.asyncFactory === b.asyncFactory && // 标签是否相同
    ((a.tag === b.tag &&
      // 是否都是注释节点
      a.isComment === b.isComment &&
      // 是否都定义了 data
      isDef(a.data) === isDef(b.data) &&
      // 是否是相同的输入类型
      sameInputType(a, b)) ||
      (isTrue(a.isAsyncPlaceholder) && isUndef(b.asyncFactory.error)))
  )
}
```

sameVnode 的对比标准：

1. key 是否相同。
2. 是否都是异步组件工厂函数。
3. （标签相同，并且是否都是注释节点，并且是否都定义了 data，并且是否是相同的输入类型）或者（是否是异步占位节点，并且一部组件工厂函数没有报错）

### 各个 id

watcher 的 id 是从 1 开始的。

组件的 cid 是从 1 开始的，因为 Vue 构造函数的 cid 是 1

dep 的 id 初始为 0。
在 initRender 中 $attrs 使用 defineReactive 定义，这时候会生成第一个 dep，id 为 0。
在 initRender 中 $listeners 使用 defineReactive 定义，这时候会生成第一个 dep，id 为 1。
所以对于 data 的 dep，其实是从 id === 2 开始的。

vm 实例 \_uid，从 0 开始，根实例\_uid 是 0。
