# 五种 http 数据传输方式

http 数据传输一共有以下 5 种：

1. url param
2. url query
3. form-urlencoded
4. form-data
5. json

## url param

```js
http://www.baidu.com/info/123
```

这里的 123 就是路径中的参数

## url query

通过 url 种 ? 后面的字符串传递数据

```js
http://www.baidu.com/info?name=a&age=1
```

这里的 name 和 age 都是传递的数据。

> TIP
>
> 非英文字符需要使用 encodeURIComponent 转义。或者使用 query-string 库。axios 会自动进行 url encode

## form-urlencoded

跟 query 的区别只是把参数放在 body 里。其余同 query。

不适用于上传文件，因为文件 encode 太慢，这时候可以用 form-data。

> TIP
>
> 参数建议用 query-string 库 Qs.stringify() 包裹

## form-data

使用 form-data 需要指定 Content-Type 为 multipart/form-data。指定 boundary。

form-data 的分隔符默认是 "----------12312314523q4534" 一连串 "-"加 数字的形式。会在 Content-Type 中的 boundary 字段体现。

增加了 boundary 的优缺点：

1. 优点是使用 boundary 分割内容，适合传输文件，并且可以传输多个文件。
2. 缺点是增加了 boundary 分割，增加请求体。

## json

指定 Content-Type 为 application/json。

使用最多的方式。
