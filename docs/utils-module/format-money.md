# 格式化金额

## 一、JS 原生就支持格式化金额
21/04/02 更新
```js
Number.prototype.toLocaleString()

let number = 123456.789
number.toLocaleString('en-us') // "123,456.789"
```
## 二、以 ',' 分割

```js
function a(str) {
  const index = str.indexOf('.'),
    dot = ','
  let pre, suf
  if (index !== -1) {
    pre = str.slice(0, index)
    suf = str.slice(index)
  } else {
    pre = str
  }

  const list = pre.split('')
  pre = ''

  let v
  for (let i = list.length - 1; i >= 0; i--) {
    v = list[i]
    pre = v + pre
    if (!(i % 3)) {
      pre = dot + pre
    }
  }

  if (suf) {
    pre = pre + suf
  }
  if (pre.indexOf(dot) === 0) {
    pre = pre.slice(1)
  }
  console.log(pre)
  return pre
}

a('123456789') // 123,456,789
```
