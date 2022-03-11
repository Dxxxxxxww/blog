---
sidebar: auto
---

# JavaScript 奇技淫巧
## 无限debugger

```js
;(function () {
  var a = new Date()
  debugger
  return new Date() - a > 100
})()
```

