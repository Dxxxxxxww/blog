# rollup

rollup 是一款 esm 打包器，诸如一些 HMR 这种高级特性，rollup 并不支持。

rollup 并不是要替代 webpack，而是提供一个充分利用 esm 各项特性的高效打包器。webpack 大而全，rollup 小而美。

rollup 默认会开启 tree-shaking。

插件是 rollup 的唯一扩展方式。不像 webpack 那样，有 loader，plugins， optimization

## rollup 配置文件

rollup 同样支持配置文件的形式进行打包，只需要在根目录下新建 rollup.config.js。rollup 会对配置文件做额外处理，所以配置文件中可以使用 esm 。

若要使用配置文件，执行的时候需要加上 --config 参数

```js
npm rollup --config
```

## plugins

### rollup-plugin-node-resolve

rollup 不能像 webpack 那样通过名称导入 npm 包，而是只能按照文件路径导入，rollup-plugin-node-resolve 可以抹平这种差异。

### rollup-plugin-commonjs

rollup 默认只支持 esm，但是有大量的包使用的是 cmj，这个插件可以让 rollup 支持 cmj

## code splitting

新版的 rollup 已经支持 code splitting 了。

## rollup 与 webpack 选择

rollup：开发库。

rollup 缺点：

1. 加载非 esm 的第三方模块比较复杂，需要配置插件；
2. 模块最终都被打包到一个函数中，无法实现 hmr；
3. 浏览器环境中，代码拆分功能以来 amd。

rollup 优点：

1. 输出更加扁平，执行效率高；
2. 自动移除未引用代码；
3. 打包结果完全可读。

在开发应用程序的时候，需要大量引入第三方包，并且需要分包，hmr 这些特性。所以需要 webpack。

如果是开发库的话，rollup 就很实用。因为它的优点都很有必要，缺点可以忽略。
