# 网络相关

## prefetch 和 preload

[prefetch 和 preload](https://zhuanlan.zhihu.com/p/48521680)

preload：加载对应的资源但不执行，等到真正要执行的时候才去执行。

prefetch：跟 preload 不同，它的作用是告诉浏览器未来可能会使用到的某个资源，浏览器就会在**闲时**去加载对应的资源，若能预测到用户的行为，比如懒加载，点击到其它页面等则相当于提前预加载了需要的资源。

prefetch 比 preload 的兼容性更好

## defer 和 async
