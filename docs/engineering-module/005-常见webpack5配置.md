# 常见的 webpack5 配置

webpack 是一个模块打包器（bundler），它能将多个 js 文件打包成一个文件。对于其他资源来说，webpack 就需要借助对应的 loader 来进行资源转化及加载。

这里只是记录一下常用的配置，具体配置写法去官方文档里查询。**注：带 \* 则表示 webpack5 中的新修改项目**

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

### babel-loader

提供的语言转译能力，能在确保产物兼容性的同时，让我们大胆使用各种新的 ECMAScript 语言特性

- @babel/preset-env：各种 ES6 代码转 ES5 的预设 

安装方法：

```shell
npm i -D @babel/core @babel/preset-env babel-loader
```

使用方法：

```js
module.exports = {
  /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        ],
      },
    ],
  },
};

// 又或者
module.exports = {
    /* ... */
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ['babel-loader']
      }
    ],
  },
};


// babel.config.js

module.exports = {
  presets: ['@babel/preset-env']
}
```

#### polyfill

对 babel 一些不能做转换的语法补充。webpack4 默认携带，webpack5 为了优化打包体积默认移除，需要用时添加即可。

babel7 之后只需要添加 core-js regenerator-runtime 即可。

babel7 之前是 polyfill，babel 7 之后是 core js。babel7 是 core2，babel8 是 core 3。

```js
module.exports = {
  presets: [
    '@babel/preset-env',
    {
      // false: 不对当前的 js 做 polyfill 处理
      // usage：依据代码中所使用到的代码做兼容处理
      // entry：依据 browserslist 选择的浏览器范围做处理
      useBuiltIns: 'usage',
      // 安装的 corejs 版本
      corejs: 3
    }
  ]
}
```

如果一些第三方包已经使用了 @babel/polyfill，再在配置中使用 usage 做处理会有问题，这时候需要在 webpack 配置中给 babel-loader 添加 exclude: /node_modules/

#### 如何根据模式有选择的使用 babel 插件

可以在 webpack 配置文件中给 process.env 手动挂载值，然后在 babelrc 中通过 process.env. 获取。如果单纯的通过 webpack.mode 设置的 process.env.NODE_ENV，在诸如 babelrc 这样的非模块文件中无法获取到。

#### why？

究其原因是，在 webpack.mode 中设置模式，是通过 DefinePlugin 给 process.env.NODE_ENV 的值设置。这种全局变量在非模块配置文件中无法获取。而又因为配置文件的执行是归 webpack 控制，所以在 webpack 配置文件 中手动添加变量，是可以获取到的。也就是说 DefinePlugin 设置的全局变量只能在模块中使用。

### ts 相关 loader

提供的类型检查能力，能有效提升应用代码的健壮性

- ts-loader: ts 有语法错误时可以在编译期间报错。做语法校验。
- babel-loader: ts 只是简单完成代码转换，并未做类似 ts-loader 的类型检查工作。需要在 preset 中加上@babel/preset-typescript

更推荐使用 babel-loader，原因如下：

1. babel-loader 会忽略 ts 类型检查，能让整个转换操作变得更快
2. ts-loader 用于将 typescript 转换为 javascript；babel-loader 则用于根据我们的要求将该 javascript 转换为目标浏览器友好的代码版本。（当然，使用 ts-loader 先转换 ts，再使用 babel-loader 对 js 做降级处理应该也是可以的，没实践过）

使用 babel-loader，兼容类型检查的解决办法: 使用 babel-loader 并在 npm 中添加脚本，使用 tsc 来进行类型检查。

```js
scriptes: {
  'build': 'npm run ts && webpack',
  'ts': 'tsc --noEmit'  // noEmit 指的是不生成转换 js 文件。
}
```

安装方法：
```shell
npm i -D webpack webpack-cli \
    # babel 依赖
    @babel/core @babel/cli @babel/preset-env babel-loader \
    # TypeScript 依赖
    typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin \
    @babel/preset-typescript \
    # ESLint 依赖
    eslint eslint-webpack-plugin
```

也可以使用 eslint 插件的方法。使用方法：

```js
module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'babel-loader',
          options: { presets: ['@babel/preset-typescript'] }
        }
      }
    ]
  },
  plugins: [new ESLintPlugin({ extensions: ['.js', '.ts'] })]
}
```

在 eslintrc 中使用类型检查插件

```json
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": ["plugin:@typescript-eslint/recommended"]
}
```

ts-loader 安装方法：

```shell
npm i -D typescript ts-loader
```

ts-loader 使用方法：

```js
const path = require('path');

module.exports = {
  /* xxx */
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    //  自动解析 .ts 后缀文件，在导入 ts 模块时就不需要加后缀了
    extensions: ['.ts', '.js'],
  }
};
```

创建 tsconfig.json 文件来配置 ts
```json
{
  "compilerOptions": {
    "noImplicitAny": true,
    "moduleResolution": "node"
  }
}
```

### css 相关的 loader

css 相关的 loader 有以下几种：

- css-loader
- style-loader
- less-loader
- postcss-loader

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
                // css 中又导入了其他css文件就需要这样处理
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

- file-loader

拷贝图片，分开请求。可以修改打包后的图片名称。

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

- url-loader

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

## browserslist

[browsers-use](https://caniuse.com/usage-table)

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
plugins: [new CleanWebpackPlugin()]
```

### html-webpack-plugin

简化了 HTML 文件的创建，为 webpack 打包服务。可自定 html 模板文件。

```js
plugins: [new HtmlWebpackPlugin()]
```

### webpack.DefinePlugin

定义 webpack 全局变量

```js
plugins: [
  new webpack.DefinePlugin({
    BASE_SRC: '"./"' // DefinePlugin 这里需要注意字符串要带上引号
  })
]
```

### copy-webpack-plugin

拷贝文件，用来拷贝静态文件

```js
plugins: [new CopyWebpackPlugin()]
```

### \* MiniCssExtractPlugin

文档上说 v5 版本才能使用，但是 v4 也能使用。抽离 css 成单独文件。更低版本可以使用 extract-text-webpack-plugin，v4+版本不推荐使用，会有问题。

### \* CssMinimizerWebpackPlugin

对 css 文件进行压缩。v4 版本下可以使用 optimize-css-assets-webpack-plugin，此插件在 v5 版本无法压缩。

### TerserWebpackPlugin

压缩，丑化 js 代码。v5 版本已内置 TerserWebpackPlugin 插件。之前可能更多的是使用 uglify-js，但是 uglify-es 不再维护了，uglify-js 也不支持 es6+了。

### ModuleConcatenationPlugin

scope hoisting,也可以说是合并模块。会“提升”或将所有模块的作用域连接到一个闭包中，从而让代码在浏览器中有更快的执行时间。生产模式已经默认配置。依赖 ESM 在编译时导出/导入的静态分析，所以在 web 端最好都是用 ESM 而非 CMJ。

### purgecss-webpack-plugin

css tree-shaking 插件

### CompressionWebpackPlugin

优化手段。

开启压缩，默认 gzip 算法。把资源压缩好给服务器，当浏览器支持 gzip 时，就可以使用已经压缩过的代码。

#### CompressionWebpackPlugin.minRatio

压缩比，默认 0.8。如果设置太小，压缩算法没办法做到的话就不会去压缩。一般使用默认值 0.8 就行了。

### inline-chunk-html-plugin

将 js 代码注入 index.html 文件中。对于一些代码量少的文件，如果通过 script 外链的形式发请求来载入的话有点浪费，通过这个插件可以将代码量少的文件直接注入到 index.html 文件中。减少请求。

### speed-measure-webpack-plugin

分析 webpack-plugin，webpack-loader 的耗时，分析模块打包耗时。与 MiniCssExtractPlugin 有兼容问题，需要将 MiniCssExtractPlugin 降到 1.x 版本。

### webpack-bundle-analyzer

打包文件大小分析。

### HotModuleReplacementPlugin

HMR 的插件

### CommonsChunkPlugin

通过将公共模块从 bundle 中分离出来，得到的块文件可以在最初加载一次，并存储在缓存中供以后使用。这将导致页面速度优化，因为浏览器可以快速地从缓存提供共享代码，而不是在访问新页面时强制加载更大的包。

### mini-css-extract-plugin

webpack 5 中 css 以 link 标签形式加载到 head 中。分离 css 并单独打包。

当 Webpack 版本低于 5.0 时，使用 extract-text-webpack-plugin 代替 mini-css-extract-plugin。

### eslint

提供的风格检查能力，能确保多人协作时的代码一致性

安装方法：

```shell
# 安装 webpack 依赖
yarn add -D webpack webpack-cli

# 安装 eslint 
yarn add -D eslint eslint-webpack-plugin

# 简单起见，这里直接使用 standard 规范
yarn add -D eslint-config-standard eslint-plugin-promise eslint-plugin-import eslint-plugin-node eslint-plugin-n
```

使用方法：在根目录添加 .eslintrc 文件

```json
{
  "extends": "standard"
}
```

在 webpack.config.js 中增加插件

```js
// webpack.config.js
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')

module.exports = {
  entry: './src/index',
  mode: 'development',
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist')
  },
  // 添加 eslint-webpack-plugin 插件实例
  plugins: [new ESLintPlugin()]
}
```

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

开启配置：设置 hot: true, hotOnly: true，再配上 HotModuleReplacementPlugin

模块热更新，只更新改变的模块，而不会使整个页面都刷新。开启 HMR 之后，css 会直接启动模块热更新，因为 loader 已经做了这方面工作。为什么 js 不行，因为 js 模块是没有任何规律的，可能导出对象/变量/常量/函数，并且对于这些导出的东西的使用也各不相同。对于 css 而言，只需要把新的样式替换上去就行了。

使用 vue/react 为什么可以呢？因为这两者的框架对于导出有着规则限制，是有一定规律的。框架内部已经提供好了通用 HMR 解决方案，vue-loader 内置了 hmr 的代码，react 则是通过 babel-preset，详细可以查看 webpack 文档 guides 中的 hmr 模块。

hot 是 webpack-dev-server 的 hmr 配置。 webpack-hot-middleware 是 webpack-dev-middleware 设置的自定义服务的 hmr 配置。

## devServer

webpack-dev-server 的配置选项

### devServer.publicPath

指定本地服务所在的目录。

```js
// 配置目录之后
devServer.publicPath = '/lg'
// 本地域名访问
https://localhost:8080/lg
```

大部分情况下，output.publicPath 与 devServer.publicPath 需要设置为相同的值。

### \* devServer.contentBase

webpack5 文档中已不存在

规定一些不被 webpack 打包的文件，但是在 index.html 中引用的资源去哪查找。绝对路径。

### devServer.proxy

跨域代理，转发请求。

### devServer.compress

开发服务启用 gzip 压缩。

## resolve

### resolve.alias

别名

### resolve.extensions

文件引入时自动补全后缀

### resolve.mainFiles

引入文件夹时默认查找目录下的指定文件，默认值是 index。这也是为什么我们在文件夹下写 index 文件就能成功引入的原因。

### resolve.modules

引入模块时默认查找指定目录，默认值时 node_modules。

## mode

告诉 webpack 使用哪种模式的配置。'development' | 'production'

## devtool

**注意，这块的代码实践可以看 ele 项目**

配置 source-map, sourcemap。默认配置跟随 mode。

source-map：加密代码与源代码的映射关系，方便调试定位源代码。

hidden-source-map：生产环境可以配置成这个。与 source-map 相同，会生成 map 文件，但不向 bundle 添加引用注释，sources 面板中也看不到 map。可以通过 add source map 从错误报告映射错误堆栈跟踪，并且浏览器开发工具查看不到源代码。

添加方式为 域名+文件路径。配置可以使用协议跟随的方式，也就是不带 http: 或者 https:
e.g. http(s)://127.0.0.1:9002/js/app.f75e8a1c.js.map 

只需要对一个 js 文件进行添加，所有的源码，源码结构都会暴露。如果源码不进行变更，文件的 hash 值一直不变，则 source-map 一直会存在，有安全隐患。


![image](/webpack/hidden-source-map-1.png)
![image](/webpack/hidden-source-map-2.png)
![image](/webpack/hidden-source-map-3.png)
![image](/webpack/hidden-source-map-4.png)

---

nosources-source-map：生产环境可以配置成这个。生成的 map 文件不包含源码，但是会正确提示错误的文件，错误的行数。并且项目的目录结构和文件名称会暴露在 Sources 面板中。看不到源码。

![image](/webpack/nosources-source-map-1.png)
![image](/webpack/nosources-source-map-2.png)

---

使用 webpack.SourceMapDevToolPlugin 插件。

需要设置 devtool = "none"。并且 webpack.SourceMapDevToolPlugin 不能跟 TerserPlugin 共存，只能选择其他代码压缩插件，例如 CompressionPlugin。

这种方式的最大好处在于不需要手动 add source map，可以设置成
内网地址，这样的话在内网打开时，会自动打开 source map，并且外网无法访问，非常安全。

```js
// 设置成协议跟随的方式，就不需要区分 http https
new webpack.SourceMapDevToolPlugin({
    append: "\n//# sourceMappingURL=//127.0.0.1:9002/[url]",
    filename: "map/[name].js.map"
})
```

e.g. //# sourceMappingURL=//127.0.0.1:9002/../map/app.js.map

## optimization

优化

### optimization.splitChunks

优化手段。

code splitting，代码分割，可以将业务代码和第三方包分离。这样做的好处是，基本不变动的第三方包在用户端会有缓存，当我们软件更新时，用户端只需要下载更新业务代码。

```js
splitChunks: {
      chunks: 'all', // 'async'， 默认值为 'initial'
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

#### 动态 import

动态 import 可以实现懒加载。动态 import 的文件会自动拆包(splitChunks)，因为动态请求时，文件不一定已经加载完成，所以不能与其他代码打包在一起。

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

### optimization.minimize

告诉 webpack 使用 TerserPlugin 或在 optimization.minimizer 中指定的插件来最小化 bundle。

### optimization.minimizer

压缩模块，对文件进行压缩。对于 js 文件来说可以使用 TerserWebpackPlugin，css 文件可以使用 CssMinimizerWebpackPlugin。

## tree-shaking

优化手段。

基于 ESM 的静态分析实现，将一些不用的代码（导出了，但是没有地方有导入使用，dead-code）从打包流程中剔除。它是一组搭配使用后的优化效果，不是某个配置选项，在生产模式下自动启用。

#### usedExports

optimization.usedExports，标记出哪些代码没有被使用，清理还需要通过设置 optimization.minimize，通过 TerserWebpackPlugin 插件压缩代码。

```js
module.exports = {
  //...
  optimization: {
    usedExports: true,
    minimizer: [new TerserPlugin()]
  }
}
```

#### sideEffects

optimization.sideEffects 开启。 package.json sideEffects 标记保留文件。

使用 sideEffects 的前提是确保文件中没有副作用代码。因为如果有副作用代码，而被删除了的话，就会导致程序出错。这里的副作用代码指除了导出成员外所做的事情(比如在 window 上挂载)。

false 为删除副作用代码，true 为保留。数组中配置路径，可以有选择的保留哪些副作用，可以通过这种方式来选择保留一些需要的 js 和 css 代码。不过 一般而言，可以在 配置 css 相关 loader 的地方，跟 test, use 同级下增加 sideEffects: true，来保留 css。

这两种不是替代的关系。

tree-shaking 的前提是必须使用 ESM。但是 babel 中的 preset-env 会将 ESM 转换成 CMJ。webpack 拿到 转换后的代码，就不能执行 tree-shaking 了(最新版 babel 已经支持 ESM，它会禁用 ESM->CMJ 的转换，所以 webpack 能使用 tree-shaking)。

### prefetch preload

prefetch：预加载，在浏览器空闲时间加载文件。

```js
import(/* webpackPrefetch: true */ './path/to/LoginModal.js')
```

preload：会与父块并行加载。

区别：

1. preload chunk 会在父 chunk 加载时，以并行方式开始加载，prefetch chunk 会在父 chunk 加载结束后开始加载。
2. preload chunk 具有中等优先级，并立即下载。prefetch chunk 在浏览器闲置时下载。
3. preload chunk 会在父 chunk 中立即请求，用于当下时刻。prefetch chunk 会用于未来的某个时刻。
4. 浏览器支持程度不同。

## externals

优化手段。

可以将一些基本不变的包排除在打包范围外，放在服务器上请求，常与 CDN 配合使用。排除在外的文件，需要在 public/index.html 模板文件中添加资源在 cdn 上的地址。

这样做可以优化打包速度。对于部署在 cdn 上的包来说，一般也都是基本不变的资源，用户在请求一次之后后续都会有缓存的。

cdn 优点：通过中心平台的负载均衡、内容分发、调度等功能模块，使用户就近获取所需内容，降低网络拥塞，提高用户访问响应速度和命中率。

## dll

dll 支持 tree-shaking。而 externals 出来的文件基本都是 umd 包，不支持。

优化手段。

仅做了解，在 webpackv4 起已经不需要通过 dll 来优化打包速度了。vue/react 中已移除 dll 打包操作。

与 externals 排除包然后放在 cdn 上有点类似。将一些不常改变的包移动到单独的编译中，进行单独的打包操作(单独起一个项目，引入包进行打包操作)，生成 dll 库，后续可以直接引入。减少项目打包时间。

## webpack 打包库

```js
output: {
    filename: 'xx.js',
    // js 通用模块定义规范，能让 js 在所有环境下工作
    libraryTarget: 'umd',
    // 全局变量名，类似于 JQuery 的 $，库的变量方法都通过这里的设置来访问
    library: 'xx',
    // 一般都写 this，在 web 端指向 window
    globalObject: 'this',
}
```

## 暴露 react 的 webpack 配置

npm run eject

```js
// package.json
script: {
    eject: react-scripts eject
}
```

## 暴露 vue 的 webpack 配置

https://cli.vuejs.org/zh/guide/webpack.html#%E5%AE%A1%E6%9F%A5%E9%A1%B9%E7%9B%AE%E7%9A%84-webpack-%E9%85%8D%E7%BD%AE

```js
vue inspect > output.js
```

## 其他 tips

- \_\_dirname: 指向当前执行 js 文件的绝对路径，到文件夹为止。
- path.join: 将传入的参数拼接成一个路径。会自动使用平台特定的分隔符把参数连接(自动加'/')，并规范化生成的路径。
- path.resolve: 根据参数解析出一个绝对路径。根据参数从右往左，直到解析出一个绝对路径。
- process.cwd: 当前执行 node 命令时候的文件夹地址。
- 如果 webpack 配置导出的是函数，其形参 env 的值可以就是 npm script 中的 --env 传入的值。

