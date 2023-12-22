# react 学习笔记

## hooks 相关

## 组件生命周期

react 组件的执行阶段分为三个阶段：

1. Trigger 触发渲染。 
    - 初始化渲染是 createRoot 调用，并执行 root.render()。
    - 更新渲染则是状态修改引起的渲染。
2. Render 执行状态队列，获取新的状态，执行组件函数本体。可以理解为 vue 的 h 函数执行获取有新状态的 vnode，并进行 diff。 
3. Commit 拿着 render 返回的结果，去同步 DOM 更新的阶段。render 和 commit 分开以达到批量更新 DOM 的目的，也是 react 之后退出并行模式的设计基础。可以理解为 vue 的 patch。将 vnode 的修改的结果更新到 dom 上。
4. Browser paint 浏览器绘制（渲染）。useEffect 在浏览器绘制之后执行？。
