# 常见的 webpack5 配置

这里只是记录一下常用的配置，具体配置写法去官方文档里查询。<b>注：带 \* 则表示 webpack5 中的新修改项目</b>

## \* require

webpack5 中 require 导入的是模块对象，其 default 才是真正的路径。

1. require('xx').default
2. 在对应 loader 的 options 中配置 esModule: false
3. 使用 import 导入资源

## context

The base directory, an absolute path, for resolving entry points and loaders from the configuration.

使用绝对路径定义基本目录，用于从配置中解析 entry 。

entry 的相对路径就是相对于 context 而言的。

## output

### output.publicPath

定义 index.html 引用的资源的基本路径

## Loader

对特定类型的文件做转换处理。像 css，图片，字体等等。工作时机确定 -> 在读取文件内容时。在 module 下配置。

### css 相关的 loader

css 相关的 loader 有以下几种：

-   css-loader
-   style-loader
-   less-loader
-   postcss-loader

loader 执行顺序是从右往左，从下往上。所以编写顺序应该是：

```js
// postcss 使用 autoprefixer 来加前缀
// postcss-preset-env 预设了很多 postcss 所需的插件。 xx-preset-env 预设插件集
// *.css
["style-loader", "css-loader", "postcss-loader"];
// *.less
["style-loader", "css-loader", "postcss-loader", "less-loader"];

{
    test: /\.css$/,
    use: [
        // ...
        {
            loader: 'css-loader',
            options: {
                // 遇到需要被之前的 loader 再处理的文件的话，就修改这个步进值
                // 1 就表示 只需要前面一个 -> postcss-loader。 2 表示前面两个，以此类推
                importLoaders: 1,
                // background-url
                // webpack5 中 require 导入的图片是一个模块对象，其 default 才是真正的路径
                // 如果想要 require 直接导入路径，则使用以下配置
                esModule: false
            }
        },
        'postcss-loader'
    ]
}
```

### 图片，字体相关 loader

-   file-loader

拷贝图片，分开请求。

```js
{
    test: /\.(png|svg|gif|jpe?g)$/,
    use: [
        {
            loader: 'file-loader',
            options: {
                esModule: false // 不转为 esm
            }
        }
    ]
}
```

-   url-loader

将图片以 base64 的方式放入代码中，减少请求次数。

url-loader 中可以调用 file-loader，设置图片大小上限，超出则用 file-loader 拷贝图片

```js
{
    test: /\.(png|svg|gif|jpe?g)$/,
    use: [
        {
            loader: 'url-loader',
            options: {
                esModule: false, // 不转为 esm
                limit: 25 * 1024 // 25kb
            }
        }
    ]
}
```

### \* assest

asset module type

1. asset/resource -> file-loader
2. asset/inline -> url-loader
3. asset/source -> raw-loade 不常用
4. asset -> 自动选择是 base64 还是单独导出一个文件(就跟 url-loader 使用 limit 来做判断一样)

```js
// 图片
{
    test: /\.(png|svg|gif|jpe?g)$/,
    type: 'asset/resource'
}

// 字体
output: {
    // 统一指定导出目录
    assetModuleFilename: 'images/[hash][ext][query]'
}

{
    test: /\.(ttf|woff2?)$/,
    type: 'asset/resource',
    // 指定特定目录
    generator: {
        filename: 'static/[hash][ext][query]'
    }
}
```

### ts 相关 loader

-   ts-loader: ts 有语法错误时可以在编译期间报错。做语法校验。
-   babel-loader: ts 语法错误不会在编译期间报错，但是可以将一些 js 高阶语法做兼容处理。需要在 preset 中加上@babel/preset-typescript

解决办法: 使用 babel-loader 并在 npm 中添加脚本

```js
scriptes: {
    'build': 'npm run ts && webpack',
    'ts': 'tsc --noEmit'  // noEmit 指的是不生成转换 js 文件。
}
```

## browserslist

```js
// 选择需要兼容的浏览器范围
// package.json
// 数组中项是 或关系
"browserslist": [
    "> 1%", // 市场占有率大于 1% 的浏览器 caniuse -> Browser usage table
    "last 2 versions",
    "not ie <= 8"
  ]

// .browserslistrc
> 1%
last 2 versions
not ie <= 8
```

## plugin

可以做更多事情，工作时机不固定。在 plugins 下配置。

### clean-webpack-plugin

用来删除/清理你的构建文件夹。

```js
plugins: [new CleanWebpackPlugin()];
```

### html-webpack-plugin

简化了 HTML 文件的创建，为 webpack 打包服务。可自定 html 模板文件。

```js
plugins: [new HtmlWebpackPlugin()];
```

### webpack.DefinePlugin

定义 webpack 全局变量

```js
plugins: [
    new webpack.DefinePlugin({
        BASE_SRC: '"./"' // DefinePlugin 这里需要注意字符串要带上引号
    })
];
```

### copy-webpack-plugin

拷贝文件，用来拷贝静态文件

```js
plugins: [new CopyWebpackPlugin()];
```

## babel

对 js 做兼容处理

```js
{
    test: /\.js$/,
    use: ['babel-loader']
}

// babel.config.js

module.exports = {
    presets: ['@babel/preset-env']
}
```

### \* polyfill

对 babel 一些不能做转换的语法补充。webpack4 默认携带，webpack5 为了优化打包体积默认移除，需要用时添加即可。

babel7 之后只需要添加 core-js regenerator-runtime 即可。

```js
module.exports = {
    presets: [
        "@babel/preset-env",
        {
            // false: 不对当前的 js 做 polyfill 处理
            // usage：依据代码中所使用到的代码做兼容处理
            // entry：依据 browserslist 选择的浏览器范围做处理
            useBuiltIns: "usage",
            // 安装的 corejs 版本
            corejs: 3
        }
    ]
};
```

如果一些第三方包已经使用了 @babel/polyfill，再在配置中使用 usage 做处理会有问题，这时候需要在 webpack 配置中给 babel-loader 添加 exclude: /node_modules/

### 如何根据模式有选择的使用 babel 插件

可以在 webpack 中给 process.env 手动挂载值，然后在 babelrc 中通过 process.env. 获取。如果单纯的通过 webpack.mode 设置的 process.env.NODE_ENV，在诸如 babelrc 这样的非模块文件中无法获取到。

#### why？

究其原因是，在 webpack.mode 中设置模式，是通过 DefinePlugin 给 process.env.NODE_ENV 的值设置。这种全局变量在非模块配置文件中无法获取。而又因为配置文件的执行是归 webpack 控制，所以在 webpack 配置文件 中手动添加变量，是可以获取到的。也就是说 DefinePlugin 设置的全局变量只能在模块中使用。

## output

### publicPath

规定了 index.html 如何去查找资源(js,css 等等)，域名 + publicPath + 资源

## webpack-dev-server

[详细](https://webpack.js.org/guides/development/#using-watch-mode)

开发模式 --watch / watch: true 的不足：

1. 所有源码都会重新编译；
2. 每次编译成功都需要进行文件读写；
3. 不能实现局部刷新。

使用 webpack-dev-server 就可以解决上述问题。vue, react 都是使用这个作为服务。

### webpack-dev-middleware

是一个包装器，它会将 webpack 处理过的文件发送给服务器。这在自定义服务内部使用，来达到自定义灵活度更高的服务的目的。相当于就是通过这个中间件来联系自定义 node 服务与 webpack。

vue cli2 生成的 vue 项目 的 dev-server.js 就是这个。

### webpack-hot-middleware

热更新中间件，配合 webpack-dev-middleware 使用

## HMR

模块热更新，只更新改变的模块，而不会使整个页面都刷新。

hot 是 webpack-dev-server 的 hmr 配置。 webpack-hot-middleware 是 webpack-dev-middleware 设置的自定义服务的 hmr 配置。

## devServer

webpack-dev-server 的配置选项

### publicPath

指定本地服务所在的目录。

```js
// 配置目录之后
devServer.publicPath = '/lg'
// 本地域名访问
https://localhost:8080/lg
```

大部分情况下，output.publicPath 与 devServer.publicPath 需要设置为相同的值。

### \* contentBase

webpack5 文档中已不存在

规定一些不被 webpack 打包的文件，但是在 index.html 中引用的资源去哪查找。绝对路径。

### proxy

跨域代理，转发请求。

## resolve

### alias

别名

### extensions

文件引入时自动补全后缀

### mainFiles

引入文件夹时默认查找目录下的指定文件，默认值是 index。这也是为什么我们在文件夹下写 index 文件就能成功引入的原因。

### modules

引入模块时默认查找指定目录，默认值时 node_modules。

## mode

告诉 webpack 使用哪种模式的配置。'development' | 'production'

## devtool

配置 source-map。默认配置跟随 mode。

source-map：加密代码与源代码的映射关系，方便调试定位源代码。

## optimization

优化

### optimization.splitChunks

代码分割，可以将业务代码和第三方包分离。这样做的好处是，基本不变动的第三方包在用户端会有缓存，当我们软件更新时，用户端只需要下载更新业务代码。

```js
splitChunks: {
     chunks: 'all',
}
```

react 中只是简单的设置

```js
splitChunks: {
    chunks: "all",
    name: isEnvDevelopment,
},
```

vue 中会使用 cacheGroups 将第三方包改名为 vender

#### splitChunks.miniSize

如果拆包后的文件达不到设置值，则不会拆包。也就是说，设置 miniSize 后，拆分后文件必须大于这个值才会拆分。

#### splitChunks.maxSize

体积大于 maxSize 才进行拆分。

maxSize 的优先级高于 maxInitialRequest/maxAsyncRequests。实际的优先级是 maxInitialRequest/maxAsyncRequests < maxSize < minSize。

#### splitChunks.minChunks

至少要被引用 x 次。优先级没有 maxSize，miniSize 高。

#### splitChunks.cacheGroups

```js
cacheGroups: {
        defaultVendors: {
          // 当 webpack 处理文件路径时，在 Unix 系统中总是包含/，在 Windows 系统中总是包含\。这就是为什么在{cacheGroup}中使用[\\/]。
          test: /[\\/]node_modules[\\/]/,
          // 如果有文件同时满足两个设置，则需要使用优先级来判断使用哪个
          priority: -10,
          reuseExistingChunk: true,
          // 修改拆包后的文件名
          filename: 'js/[id]_vender.js'
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
```

### optimization.runtimeChunk

把一些与文件源码无关的，webpack 打包生成的代码单独抽离成一个文件。

### optimization.minimizer

最小化代码。一般使用 TerserWebpackPlugin 插件来进行操作。 v5 版本已内置 TerserWebpackPlugin 插件。

## 动态 import

动态 import 可以实现懒加载。

### prefetch preload

prefetch：预加载，在浏览器空闲时间加载文件。

```js
import(/* webpackPrefetch: true */ "./path/to/LoginModal.js");
```

preload：会与父块并行加载。

区别：

1. preload chunk 会在父 chunk 加载时，以并行方式开始加载，prefetch chunk 会在父 chunk 加载结束后开始加载。
2. preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。
3. preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。
4. 浏览器支持程度不同。

## externals

可以将一些基本不变的包排除在打包范围外，放在服务器上请求，常与 CDN 配合使用。排除在外的文件，需要在 public/index.html 模板文件中添加资源在 cdn 上的地址。

这样做可以优化打包速度。对于部署在 cdn 上的包来说，一般也都是基本不变的资源，用户在请求一次之后后续都会有缓存的。

## dll

仅做了解，在 webpackv4 起已经不需要通过 dll 来优化打包速度了。vue/react 中已移除 dll 打包操作。

与 externals 排除包然后放在 cdn 上有点类似。将一些不常改变的包移动到单独的编译中，进行单独的打包操作(单独起一个项目，引入包进行打包操作)，生成 dll 库，后续可以直接引入。减少项目打包时间。

## 其他 tips

-   \_\_dirname: 指向当前执行 js 文件的绝对路径，到文件夹为止。
-   path.join: 将传入的参数拼接成一个路径。会自动使用平台特定的分隔符把参数连接(自动加'/')，并规范化生成的路径。
-   path.resolve: 根据参数解析出一个绝对路径。根据参数从右往左，直到解析出一个绝对路径。
-   process.cwd: 当前执行 node 命令时候的文件夹地址。
-   如果 webpack 配置导出的是函数，其形参 env 的值可以就是 npm script 中的 --env 传入的值。
