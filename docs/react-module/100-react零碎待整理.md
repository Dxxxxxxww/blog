# react 零碎待整理

## 过时的生命周期

### componentWillReceiveProps

官方文档：如果父组件导致组件重新渲染，即使 props 没有更改，也会调用 componentWillReceiveProps 方法。如果只想处理更改，请确保当前值与变更值的比较。

结论：<b>componentWillReceiveProps 并不是由 props 的变化触发的，而是由父组件的更新触发的。</b>

## 类组件

类组件的事件在 render 中需要用 箭头函数包裹一层是为了确保 this 的指向。所以定义函数的时候直接使用箭头函数的话，在 render 中就不需要额外使用箭头函数包裹了。

## immutable, immer
