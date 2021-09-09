# 手写之三 instanceof

## 一、instanceof
```js
function instanceofMock(l, r) {
  // 如果是基本类型直接返回 false
  if (typeof l !== 'object') {
    return false
  }
  while (true) {
    // 原型链到头了
    if (l === null) {
      return false
    }
    if (l === r.prototype) {
      return true
    }
    l = l.__proto__
  }
}

instanceofMock('', String) // false

function Person() {}
const p = new Person()

instanceofMock(p, Person) // true
```