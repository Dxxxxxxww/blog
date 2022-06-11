# vue 性能优化

## 组件懒加载

vue 组件懒加载可以通过路由的方式进行。这其实是利用了 import() 异步加载。这样 webpack splitChunks 会自动将异步代码分割出去，这样就将组件单独打包成一个 chunk。
这时候可以用 webpack 魔法注释来给 chunk 命名。

```js
const Home = lazy(() => import(/* webpackChunkName: "Home" */ './Home'))
```
