# 常见的 webpack5 配置

## css 相关的 loader

css 相关的 loader 有以下几种：

-   css-loader
-   style-loader
-   less-loader
-   postcss-loader

loader 执行顺序是从右往左，从下往上。所以编写顺序应该是：

```js
// *.css
["style-loader", "css-loader"];
// *.less
["style-loader", "css-loader", "less-loader"];
```

## browserslist

```js
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
