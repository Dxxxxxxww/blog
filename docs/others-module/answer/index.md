# 答疑汇总

## 大厂的埋点

Q：大厂的埋点是怎么做的？只在重要接口处调用埋点的 api 记录吗？还是整个页面记录用户行为标志，在固定时间段/生命周期里总和后调用 api。怎么去考虑业务 api 与埋点 api 之间的性能平衡？

### 埋点类型

埋点分为手动埋点，无痕埋点。

- 手动埋点：就是在指定位置加上埋点函数。比如说按钮事件，比如说重要的接口处。缺点：较为繁琐。优点：准确性高
- 无痕埋点：就是在 document.documentElement 上通过冒泡拦截所有事件，click，change，input 等。缺点：冗杂信息庞大。优点：不需要手动添加。

目前的优解是拦截所有 api 请求，做统计上报.具体拦截方式可以参照 sentry。

### 埋点调用时机

**埋点应该在系统闲置时调用，不应该阻塞线程。**

使用方式是通过一个可降级函数来发送埋点请求。

降级函数中的 api 优先级：

1. navigator.sendbeacon
2. requestIdleCallback
3. requestanimationframe
4. setTimeout

对于一个管理后台而言，可以使用记录 xpath 的方式来进行埋点。比如，用户可以点一个元素，然后标记埋点，取个名字。这个时候存一下 xpath 到数据库。然后埋点信息收集上来后，结合 xpath 做清洗。找一下对应的埋点信息。需要注意的是， xpath 尽量要唯一。

js 获取 xpath 方式：

```js
function getXPath(node) {
  if (node.hasAttribute('id')) {
    return '//' + node.tagName + '[@id="' + node.id + '"]'
  }

  if (node.hasAttribute('class')) {
    return '//' + node.tagName + '[@class="' + node.getAttribute('class') + '"]'
  }

  var old = '/' + node.tagName
  var new_path = this.xpath(node.parentNode) + old

  return new_path
}
```

js 通过 xpath 获取 dom 的方式：

[document.evaluate()](https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate)

```js
// document.evaluate(xpath) 通过传入 xpath 返回结果。ie 不支持
const headings = document.evaluate(
  '/html/body//h2',
  document,
  null,
  XPathResult.ANY_TYPE,
  null
)
```

## https 下发起 ajaxs 请求 http 相同域的地址为什么浏览器是报错而不是跨域？

Q: `https` 网站下请求域名相同的 `http` 请求为什么不报跨域，已经是不同协议了，反而是报错。错误：mixed content。

浏览器加强了安全性，这种情况会报 `mixed-content` 的错误，并中断。简单来说，就是 `http/https` 中内容或是资源混合协议请求。

这里总结了下避免 `mixed content` 的方法，主要是从资源的角度考虑：

1. 资源部署 `http` 和 `https` 两个版本；
2. 加载资源的时候区分 `http` 和 `https` 环境。
   a. 在脚本里面可以通过 `window.location.protocol` 判断当前环境，然后去做不同的处理；
   b. 通过 `script` `加载资源的时候，src` 属性可以把协议去掉，直接以'//'开头。比如 `src="https://www.baidu.com/..."`可以直接换为`src="//www.baidu.com/..."`，这样当该脚本是在 http 网站被加载的时候，加载的就是`"http://www.baidu.com/..."`，在 `https` 网站被加载的时候，加载的就是`"https://www.baidu.com/..."`。

[mixed-content](https://segmentfault.com/a/1190000040044540)

## rollup webpack gulp grunt 我感觉都差不多，但是查资料总说有区别

gulp grunt 只是个任务流工具，相当于写了组任务，用 gulp 或者 grunt 组合而已，js 文件的依赖树解析这些，会交给别的工具处理。

webpack 解析依赖，loader 只是负责帮 webpack 识别文件。webpack 默认是识别 js module 的，但是 例如 png，ts，这些文件，你要加 loader 才能识别，loader 只是个模块转换工具，而 webpack 是个模块组合工具，产物是 bundle。

**gulp 本身不会把 js 文件当场模块处理，它只是执行 task 而已，task 用 js 写的而已。所以 gulp 是流式处理，
任务流。gulp 里面没有 模块的概念，是文件，把文件交给某个插件去再处理。css 在 webpack 里面是可以被识别成模块的，概念差距极大，工作的基本单位完全不一样，就好比，gulp 的基本单位是班级，webpack 的基本单位是人。
webpack 基于依赖树处理，gulp 基于文件流。**

gulp 要看 bundle 这一层，用的啥插件，有可能是 webpack。经典例子就是在 gulp task 中放一个 webpack
来处理 bundle。

```js
gulp.task('webpack-dev-server', function (callback) {
  var myConfig = Object.create(webpackConfig)

  // Start a webpack-dev-server
  new WebpackDevServer(webpack(myConfig), {
    publicPath: '/' + myConfig.output.publicPath,
    stats: {
      colors: true
    }
  }).listen(8080, 'localhost', function (err) {
    if (err) throw new gutil.PluginError('webpack-dev-server', err)
    gutil.log(
      '[webpack-dev-server]',
      'http://localhost:8080/webpack-dev-server/index.html'
    )
  })
})
```

webpack 官方自称模块打包器。a module bundler。rollup 是默认 tree-shaking 和 scope-hoisting 的。这什么意思呢，你去 rollup 的打包产物，就会发现，它就是 cv。而 webbpack 的模块之间会有个 webpack require 约束。比如说：

```js
__webpack_require__.d = function (exports, name, getter) {
  if (!__webpack_require__.o(exports, name)) {
    Object.defineProperty(exports, name, {
      enumerable: true,
      get: getter
    })
  }
}
```

比如打包一个模块，它会挂载在 \_\_webpack_require\_\_ 上，然后用 \_\_webpack_require\_\_ 解依赖。

rollup 不会。rollup 你理解成复制粘贴就完事儿了，输出就这么简单，单纯的合并。对于对外提供一个工具库，一个组件，一个模块来说，这样扁平简单 zero dependency 的代码是最好的。要知道，多个 \_\_webpack_require\_\_ 是可能会冲突的。这是最大的不同，由于默认 scope-hoisting，rollup 打包后的产物，执行可能有些 bug，就需要自行排查了。当然 webpack 现在也支持 scope-hoisting 了，webpack 也努力吸收了很多东西。rollup 的 cv 也是有联系的，不是瞎 cv，重名它会 rename 的，所以容易出 bug。

现在基本上已经很少使用 gulp 了。一些简单页面，比如说跳转授权中转页，可以用 gulp 来做压缩之类的操作再放到服务器，但是一般这种文件很小，也不需要压缩。

简单页面也可以直接 http-server，import http cdn，import jsx 然后开搞。

### gulp 和 webpack 的输入相同，工作模式不同，然后 gulp 依赖插件也可以做到跟 webpack 的输出相同？只不过工具定位是不同的，用插件也是可以实现相同的目的

输入也不太相同，webpack 的入口是 entry，是源码入口。而 gulp 的 gulpfile.js 约等于配置文件。webpack 的输入是 entry，然后根据入口文件生成依赖树，开始工作，如果一个文件没在依赖里面，是不会处理的。gulp 是基于正则，一堆文件，都进插件。只要正则命中，就会处理。

至于输出那肯定都是一样的，毕竟前端就是 html js css。

### parcel

parcel 的思路跟 wepback 和 rollup 都不一样，wepback 和 rollup 是面向配置工程师，parcel 是面对直接开发者。在设计上 parcel 属于能内置的要全部内置，webpack 和 rollup 你使用的时候，往往会陷入沉思，我该装什么插件，插件如何配置。所以 parcel 叫 zero configuration build tool，这种 all in one 的工具是大厂想要的。但在实际开发中，我觉得一般大家会痛恨 zero configuration build tool。因为很难做自定义扩展，想拓展的时候找入口都找半天。

### 其他

可以了解下 esbuild(go) swc
