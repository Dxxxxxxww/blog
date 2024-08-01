# react 学习笔记

## commit 阶段中三个小阶段，各对 fiber 遍历了 1 次吗

是的。

在 xxx_begin 都 执行了 while(nextEffect != null) 循环，进行深度遍历（child）。

再在 xxx_complete 中进行广度遍历（sibling），没有兄弟节点后返回父节点。

nextEffect 就是(被标记了的?存疑) fiber 节点。

### 在遍历时做一些标记要做什么事情呢？

比如设置了 ref 的节点，就会在 mutation 阶段进行 ref 清空。在 layout 阶段进行 ref 的更新。

比如 useLayoutEffect 就会在 layout 阶段（commitLayoutEffects/commitLayoutEffects_begin/commitLayoutMountEffects_complete/commitLayoutEffectOnFiber/commitHookEffectListMount）执行。

## 多次 setState update 时，是怎么根据优先级来进行 schedule 的

目前理解：
即便是多个 setState 一起触发。或者是在某个函数执行中又触发了 setState ，并且这个新的 setState 是个高优先级事件，那也没关系。因为 react 会将这个事件推到 queue 中。然后按优先级排序。在当前处理的这轮 fiber 循环中，如果有超过 5ms 的处理，会被打断，然后从 queue 中获取高优先任务执行。如果没有超过 5ms 也没事，因为 5ms 很快就执行过去了。不会延迟多少。

## useEffect 的异步是微任务还是宏任务

是宏任务，因为 useEffect 是在页面真正渲染之后才执行

## effect 的存储点 updateQueue 的数据结构是怎样的

环形链表。方便插入。尾结点指向头结点。

## beginWork 和 completeWork 具体做了什么

## 组件生命周期

粗略版

react 组件的执行阶段分为三个阶段：

1. Trigger 触发渲染。
   - 初始化渲染是 createRoot 调用，并执行 root.render()，最终通过 appendChild 挂载到 dom 上。
   - 更新渲染则是状态修改引起的渲染。
2. Render 执行状态队列，获取新的状态，执行组件函数本体。可以理解为 vue 的 h 函数执行获取有新状态的 vnode。
3. Reconcile 会将 vdom 转为 fiber 并进行 diff。（可被打断，可调度，也就是 fiber 的 schedule）
4. Commit 拿着 render 返回的结果，去同步 DOM 更新的阶段。render 和 commit 分开以达到批量更新 DOM 的目的，也是 react 之后退出并行模式的设计基础。可以理解为 vue 的 patch。将 vnode 的修改的结果更新到 dom 上。
5. Browser paint 浏览器绘制（渲染）。
6. 执行 useEffect

## react update

对 react 来说，更重要的是组件组件在 UI 树中的位置，而不是在 jsx 中的位置。这是判断组件在重新渲染时是否复用的判断条件。
