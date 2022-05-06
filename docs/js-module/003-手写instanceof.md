# 手写之三 instanceof

## instanceof

### 递归写法

```js
function MyInstanceof(obj, constructor) {
  const proto = Object.getPrototypeOf(obj)
  if (!proto) {
    return false
  }
  if (proto !== constructor.prototype) {
    return MyInstanceof(proto, constructor)
  }
  return true
}

function A() {}

const a = new A()
const c = ''

// console.log(MyInstanceof(a, A))
// console.log(MyInstanceof(c, A))
```

### 使用 Object.getPrototypeOf()

```js
function myInstanceOf(l, r) {
  // 如果是基本类型直接返回 false
  if (typeof l !== 'object') {
    return false
  }
  while (true) {
    if (l === null) {
      return false
    }
    if (l === r.prototype) {
      return true
    }
    l = Object.getPrototypeOf(l)
  }
}
```

### 使用 \_\_proto\_\_

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
