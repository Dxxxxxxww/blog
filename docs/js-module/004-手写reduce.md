# 手写之四 reduce

## 一、reduce
```js
// 先做环境嗅探
Array.prototype.reduce =
  Array.prototype.reduce ||
  function r2(callback, initVal) {
    // 存一下调用 reduce 的数组
    const arr = this
    // 判断是否传入初始默认值
    const isHasInitVal = arguments.length > 1
    // 如果有默认值取默认值，没有默认值取数组第一位为默认值
    let base = isHasInitVal ? initVal : arr[0]
    // 如果有默认值，数组从 0 开始遍历，如果没有默认值，数组从 1 开始遍历
    const startIndex = isHasInitVal ? 0 : 1
    // 取一下数组
    arr.slice(startIndex).forEach((val, index) => {
      // callback 的参数，上一个值，当前值，当前值的index，数组
      base = callback(base, val, index + startIndex, arr)
    })
    return base
  }

```