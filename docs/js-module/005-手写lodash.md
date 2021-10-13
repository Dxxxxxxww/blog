# 其他手写

## lodash.curry

```js
function _c(fn) {
  const params = Array.prototype.slice.call(arguments, 1)
  if (params.length < fn.length) {
    return function(...args) {
      return fn(...params.concat(args))
    }
  }
  return fn(...params)
}
```

## lodash.flowRight

flowRight 参数从右往左开始调用

```js
// 函数组合，函数洋葱调用的封装
// 函数洋葱调用  a(b(c()))
// 函数组合需要满足结合律，即：
// compose(a, b, c), compose(compose(a, b), c), compose(a, compose(b, c)), 结果相同
const flowRight = (...args) => (value) =>
  args.reverse().reduce((initVal, current) => current(initVal), value)

const fi = (arr) => arr[0]
const re = (arr) => arr.reverse()
const tu = (str) => str.toUpperCase()

const a = ['t', 'r', 'y']

console.log(flowRight(tu, fi, re)(a))

// 组合中若想查看哪个函数出错了也可以自己写个 log 函数

const log = (tag) => (val) => {
  console.log(val)
  return val
}

flowRight(tu, log, fi, log, re)(a)
```

## lodash.flow

flow 参数从左往右开始调用

```js
const flowRight = (...args) => (value) =>
  args.reduce((initVal, current) => current(initVal), value)

const fi = (arr) => arr[0]
const re = (arr) => arr.reverse()
const tu = (str) => str.toUpperCase()

const a = ['t', 'r', 'y']

console.log(flowRight(re, fi, tu)(a))
```
