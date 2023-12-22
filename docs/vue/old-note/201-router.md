# vue 路由总结

## hash 模式 与 history 模式

-   hash：基于锚点，以及 onhashchange 事件。
-   history：基于 html5 中的 history api。history.pushState, history.replaceState。

### history api 简介

输入网址就是个去服务端查找文件的过程。使用 history.pushState 方法会在历史中添加一条记录。只会改变地址栏地址，不会发起请求去服务端查找文件，导致页面跳转。ie10 才开始支持。

而 history.back、history.forward、history.go 方法是会导致页面跳转。

### history 需要后端配置

这也就解释了为什么 history 模式为什么需要服务端配置。因为需要服务端配置除了静态资源以外都返回单页应用的 index.html。用以拦截用户在地址栏的任意输入，让页面不会跳转到其他不存在的页面导致 404 错误。

vue cli 创建的服务器已经设置了对 history 模式的支持。

### history 模式具体流程

当我们使用 history 模式，服务端开启了 history 的支持。在浏览器上刷新页面，会去服务端请求对应地址文件，如果服务端没有找到对应文件，则会返回 index.html 文件。在我们客户端上拿到了 index.html 文件，并且发现地址栏的地址并不是 index，就会通过路由去找到对应组件。以下是例子：

1. 浏览器刷新，去请求 https://localhost:3000/about；
2. 服务端找不到 about 文件，默认返回 index；
3. 浏览器拿到 index 文件，并且地址栏还是 about，就会去找 about 组件。
