# react 学习笔记

## hooks 相关

### useEffect

我们都知道 useEffect 第二个参数传 [] 时，useEffect 只会在组件渲染执行，可以理解为 "mounted" 。但是究其根本，其实是组件函数重新执行时，useEffect 判断到依赖不变（因为是[]），所以跳过了执行。而非不执行。

## 组件生命周期

react 组件的执行阶段分为三个阶段：

1. render 阶段：执行组件函数本体。可以理解为 vue 的 h 函数执行获取 vnode。
2. commit 阶段：拿着 render 返回的结果，去同步 DOM 更新的阶段。render 和 commit 分开以达到批量更新 DOM 的目的，也是 react 之后退出并行模式的设计基础。可以理解为 vue 的 patch。
3. dom 更新结束：此时 dom 已经更新完成，代码上的体现就是执行 useEffect。
