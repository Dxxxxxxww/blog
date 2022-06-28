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
