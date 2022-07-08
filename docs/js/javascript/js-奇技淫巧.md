---
sidebar: auto
---

# JavaScript 奇技淫巧

## 无限 debugger

```js
;(function () {
  var a = new Date()
  debugger
  return new Date() - a > 100
})()
```

```js
// 在 main.jd 中判断环境导入下面的代码执行
// no-debugger.js
;(() => {
  function block() {
    if (
      window.outerHeight - window.innerHeight > 200 ||
      window.outerWidth - window.innerWidth > 200
    ) {
      document.body.innerHTML = 'no debugger'
    }
    setInterval(() => {
      ;(function () {
        return false
      }
        ['constructor']('debugger')
        ['call']())
    }, 50)
  }
  try {
    block()
  } catch (err) {}
})()
```

## 格式化金额

### JS 原生就支持格式化金额

```js
Number.prototype.toLocaleString()

let number = 123456.789
number.toLocaleString('en-us') // "123,456.789"
```

### 以 ',' 分割

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

## js 可以判断当前浏览器支不支持直接写 0.5px

1. 写个 border-top: 0.5px
2. 然后判断 offsetHeight === 1
3. 如果等于就是不支持，不等于就是支持
