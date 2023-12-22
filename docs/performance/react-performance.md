# react 性能优化

## 组件懒加载

react 组件懒加载可以通过路由的方式进行。这其实是利用了 import() 异步加载。这样 webpack splitChunks 会自动将异步代码分割出去，这样就将组件单独打包成一个 chunk。
这时候可以用 webpack 魔法注释来给 chunk 命名。

```js
const Home = lazy(() => import(/* webpackChunkName: "Home" */ './Home'))
```

当然也可以通过条件判断的方式，vue 2.x 这种方式就不太适合

```js
let LazyComponent = null
if (true) {
  LazyComponent = lazy(() => import(/* webpackChunkName: "Home"*/ './Home'))
} else {
  LazyComponent = lazy(() => import(/* webpackChunkName: "List"*/ './List'))
}
```

## 子组件使用 React.memo

“React.memo 仅检查 props 变更。如果函数组件被 React.memo 包裹，且其实现中拥有 useState，useReducer 或 useContext 的 Hook，当 state 或 context 发生变化时，它仍会重新渲染。”

“默认情况下其只会对复杂对象做浅层对比，如果你想要控制对比过程，那么请将自定义的比较函数通过第二个参数传入来实现。”

如果 props 是一个 引用类型，则可以给 memo 传递第二个参数，来进行值的比较。

```jsx
function MyComponent(props) {
  /* 使用 props 渲染 */
}
function areEqual(prevProps, nextProps) {
  /*
  如果把 nextProps 传入 render 方法的返回结果与
  将 prevProps 传入 render 方法的返回结果一致则返回 true，
  否则返回 false
  */
  // 返回 true 则不需要重新渲染
  // 返回 false 需要重新渲染
}
export default React.memo(MyComponent, areEqual)
```

## 使用 Fragment 作为无意义的单根标签

```jsx
function App() {
  return (
    // 使用 Fragment 来代替，不会真实渲染
    <Fragment>
      <div>message a </div>
      <div>message b </div>
    </Fragment>
  )
}
// 无意义的 div ，如果太多就会，增加渲染负担
function App() {
  return (
    <div>
      <div>message a </div>
      <div>message b </div>
    </div>
  )
}
```

## 避免使用内联样式属性

当使用内联 style 为元素添加样式时，内联 style 会被编译为 js 代码，通过 js 代码再将样式规则映射到元素上。浏览器需要话费更多的时间执行脚本和渲染 UI，从而增加了组件的渲染时间。

更好的办法是将 css 文件导入样式组件，能通过 css 直接做的事情就不要通过 js 去做，js 操作 dom 非常慢。

```jsx
function App() {
  return <div style={{ backgroundColor: 'blue' }}> App </div>
}
```

##
