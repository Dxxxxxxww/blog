# 结构化区分 webpack5 配置

![image](/webapck/structured-webpack.png)


## css 相关配置

loader：

- css-loader。将 CSS 等价翻译为形如 module.exports = "${css}" 的JavaScript 代码，使得 Webpack 能够如同处理 JS 代码一样解析 CSS 内容与资源依赖
- style-loader。将在产物中注入一系列 runtime 代码，这些代码会将 CSS 内容注入到页面的 <style> 标签，使得样式生效
- less-loader
- postcss-loader

plugin：

mini-css-extract-plugin：该插件会将 CSS 代码抽离到单独的 .css 文件，并将文件通过 <link> 标签方式插入到页面中
extract-text-webpack-plugin：当 Webpack 版本低于 5.0 时，代替 mini-css-extract-plugin
