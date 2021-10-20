# react 零碎待整理

## 过时的生命周期

### componentWillReceiveProps

官方文档：如果父组件导致组件重新渲染，即使 props 没有更改，也会调用 componentWillReceiveProps 方法。如果只想处理更改，请确保当前值与变更值的比较。

结论：<b>componentWillReceiveProps 并不是由 props 的变化触发的，而是由父组件的更新触发的。</b>
