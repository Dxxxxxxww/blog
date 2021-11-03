# filter 的细节

## 一、filter
filter 无法返回 index，永远返回的是数组项。
```js
var numbers = [1, 2, 3];

var b = numbers.filter(function (n, i) {
  return i;
});

// 这里因为 index 为 0 时，判断为 false，所以不返回值。
b // [2, 3]
```

## 二、替代方案
如果想遍历数组返回某项 index 的话，可以使用如下替代方案：
1. 使用 es6 findIndex；
2. 使用 map；
3. 使用 for。

以下是使用 map 的例子：
```js
var numbers = [1, 2, 3];

var b = numbers.map(function (n, i) {
  return i;
});

b // [0, 1, 2]
```