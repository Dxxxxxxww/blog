---
sidebar: auto
---

# js 手写

## 深拷贝

先写一个判断数据类型的方法

```js
const analyseType = o => {
  var s = Object.prototype.toString.call(o)
  return s.match(/\[object (.*?)\]/)[1].toLowerCase()
}

const isObject = o =>
  analyseType(o) === 'object' ||
  analyseType(o) === 'array' ||
  analyseType(o) === 'function'

const isObject = o =>
  (typeof o === 'object' || typeof o === 'function') && o !== null
```

先来个第一版，这个版本没有解决循环引用

```js
const deepClone = target => {
  if (isObject(target)) {
    let cloneTarget
    if (Array.isArray(target)) {
      cloneTarget = []
      target.forEach((v, i) => {
        cloneTarget[i] = deepClone(v)
      })
    } else {
      cloneTarget = {}
      for (const key in target) {
        if (target.hasOwnProperty(key)) {
          cloneTarget[key] = deepClone(target[key])
        }
      }
    }
    return cloneTarget
  } else {
    return target
  }
}

const a = { a: { a: 'a' }, b: 'b' }

const b = deepClone(a)

a.a.a = 'aaa'

const c = [1, 2, [3, [4]]]

const d = deepClone(c)

c[2] = 'aaa'

console.log(a, b) // { a: { a: 'aaa' }, b: 'b' } { a: { a: 'a' }, b: 'b' }

console.log(c, d) // [ 1, 2, 'aaa' ] [ 1, 2, [ 3, [ 4 ] ] ]
```

第二版，加上解决循环引用

```js
const deepClone = (target, map = new WeakMap()) => {
  if (isObject(target)) {
    // 解决循环引用，用 weakmap 防止内存泄露
    if (map.get(target)) {
      return target
    }
    map.set(target, true)
    let cloneTarget
    if (Array.isArray(target)) {
      cloneTarget = []
      target.forEach((v, i) => {
        cloneTarget[i] = deepClone(v, map)
      })
    } else {
      cloneTarget = {}
      for (const key in target) {
        if (target.hasOwnProperty(key)) {
          cloneTarget[key] = deepClone(target[key], map)
        }
      }
    }
    return cloneTarget
  } else {
    return target
  }
}

const a = { a: { a: 'a' } }
a.b = a

const c = [1, 2]
c[2] = c

console.log(deepClone(a), deepClone(c)) // { a: { a: 'a' }, b: { a: { a: 'a' }, b: [Circular] } } [ 1, 2, [ 1, 2, [Circular] ] ]
```

**结语：基本上面试的时候手写深拷贝到这里就差不多了，如果要写一个满足所有条件的深拷贝函数，且不说覆盖面的问题，单是时间花费就难以接受。毕竟工作中真正的深拷贝还是要用 lodash、JSON、messageChannel、structuredClone。**

## call

```js
// es3
Function.prototype.call3 = function() {
  const context = arguments[0],
    args = []
  context.fn = this

  for (let i = 1; i < arguments.length; i++) {
    args.push(`arguments[${i}]`)
  }
  // 使用 eval 是为了将参数展开
  const result = eval(`context.fn(${args})`)
  delete context.fn
  return result
}

// es6
Function.prototype.call6 = function(context, ...args) {
  context.fn = this
  // es6 可以直接使用 rest参数，会自动展开参数
  const result = context.fn(...args)
  delete context.fn
  return result
}

const a = 10,
  obj = {
    a: 1,
    b: {
      c: 'ccc'
    }
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
console.log(test.call3(obj, 1, 2, 'c')) // 1 + ccc + 1 + 2 + c
console.log(test.call6(obj, 1, 2, 'c')) // 1 + ccc + 1 + 2 + c
```

## apply

```js
// es3
Function.prototype.apply3 = function(context, args) {
  const params = []
  context.fn = this

  if (args) {
    for (let i = 0; i < args.length; i++) {
      params.push(`args[${i}]`)
    }
  }
  const result = eval(`context.fn(${params})`)
  delete context.fn
  return result
}

// es6
Function.prototype.apply6 = function(context, args) {
  context.fn = this
  const result = args ? context.fn(...args) : context.fn()
  delete context.fn
  return result
}

const a = 10,
  obj = {
    a: 1,
    b: {
      c: 'ccc'
    }
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
console.log(test.apply3(obj, [1, 2, 'c'])) // 1 + ccc + 1 + 2 + c
console.log(test.apply6(obj, [1, 2, 'c'])) // 1 + ccc + 1 + 2 + c
```

## bind

第一版 解决 bind 参数传递

```js
Function.prototype.apply6 = function(context, args) {
  const params = []
  context.fn = this

  if (args) {
    for (let i = 0; i < args.length; i++) {
      params.push(`args[${i}]`)
    }
  }
  const result = eval(`context.fn(${params})`)
  delete context.fn
  return result
}

Function.prototype.bind3 = function() {
  const context = arguments[0],
    args = [].slice.apply6(arguments, [1]),
    fn = this

  return function() {
    const args2 = [].slice.apply6(arguments)
    return fn.apply6(context, args.concat(args2))
  }
}

const a = 10,
  obj = {
    a: 1,
    b: {
      c: 'ccc'
    }
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
console.log(test.bind3(obj, 1, 2)('c')) // 1 + ccc + 1 + 2 + c
```

第二版，支持 new

```js
Function.prototype.apply6 = function(context, args) {
  const params = []
  context.fn = this

  if (args) {
    for (let i = 0; i < args.length; i++) {
      params.push(`args[${i}]`)
    }
  }
  const result = eval(`context.fn(${params})`)
  delete context.fn
  return result
}

Function.prototype.bind4 = function(context) {
  const args = [].slice.apply6(arguments, [1])
  const self = this
  const func = function() {
    const args2 = [].slice.apply6(arguments)
    // 通过 this 来判断是否是使用 new 来调用
    return self.apply6(
      this instanceof func ? this : context,
      args.concat(args2)
    )
  }
  // 建立原型链
  func.prototype = self.prototype
  return func
}

const a = 10,
  obj = {
    a: 1,
    b: {
      c: 'ccc'
    }
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
const value = 2

const foo = {
  value: 1
}

function bar(name, age) {
  this.habit = 'shopping'
  console.log(this.value)
  console.log(name)
  console.log(age)
}
console.log(test.bind4(obj, 1, 2)('c')) // 1 + ccc + 1 + 2 + c
const f = bar.bind4(foo, 1, 2)
console.log(new f(3))
// undefined
// 1
// 2
// bar { habit: 'shopping' }
```

上面代码中 <code>func.prototype = self.prototype </code> 是直接建立的原型链，这样会导致如果修改 bind 返回的函数的 prototype 会影响到原函数，所以还需要进行优化。

最终版

```js
Function.prototype.apply6 = function(context, args) {
  const params = []
  context.fn = this

  if (args) {
    for (let i = 0; i < args.length; i++) {
      params.push(`args[${i}]`)
    }
  }
  const result = eval(`context.fn(${params})`)
  delete context.fn
  return result
}

Function.prototype.bind5 = function(context) {
  const args = [].slice.apply6(arguments, [1]),
    self = this

  const Fc = function() {}
  Fc.prototype = self.prototype

  const func = function() {
    const args2 = [].slice.apply6(arguments)
    return self.apply6(
      this instanceof func ? this : context,
      args.concat(args2)
    )
  }
  // 继承一下，这样保证了原型链，又不会影响到父类的 prototype
  func.prototype = new Fc()
  return func
}

const a = 10,
  obj = {
    a: 1,
    b: {
      c: 'ccc'
    }
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
const value = 2

const foo = {
  value: 1
}

function bar(name, age) {
  this.habit = 'shopping'
  console.log(this.value)
  console.log(name)
  console.log(age)
}
console.log(test.bind5(obj, 1, 2)('c')) // 1 + ccc + 1 + 2 + c
const f = bar.bind5(foo, 1, 2)
console.log(new f(3))
// undefined
// 1
// 2
// bar { habit: 'shopping' }
```

**总结：call 和 apply 的实现其实是比较简单的，而且只要实现了 call，apply 也就实现了。bind 相较于 call 和 apply 难的地方在于需要考虑到 bind 的返回值作为构造函数的情况。**

## instanceof

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

## forEach

```js
Array.prototype.forEach =
  Array.prototype.forEach ||
  function(fn) {
    // 不能使用箭头函数。否则 this 不会指向数组
    const arr = this
    for (let i = 0, len = arr.length; i < len; i++) {
      fn(arr[i], i, arr)
    }
  }
```

## filter

```js
Array.prototype.filter =
  Array.prototype.filter ||
  function(fn) {
    const arr = this,
      result = []
    for (let i = 0, len = arr.length; i < len; i++) {
      const val = arr[i]
      if (fn(val, i, arr)) {
        result.push(val)
      }
    }
    return result
  }
```

## map

```js
Array.prototype.map =
  Array.prototype.map ||
  function(fn) {
    const arr = this,
      result = []
    for (let i = 0, len = arr.length; i < len; i++) {
      const val = arr[i]
      result.push(fn(val, i, arr))
    }
    return result
  }
```

## every

every 返回 false 就会终止遍历

```js
Array.prototype.every =
  Array.prototype.every ||
  function(fn) {
    const arr = this
    let result = true
    for (let i = 0, len = arr.length; i < len; i++) {
      const val = arr[i]
      result = fn(val, i, arr)
      if (!result) {
        break
      }
    }
    return result
  }
```

## some

some 返回 true 就会终止遍历

```js
Array.prototype.some =
  Array.prototype.some ||
  function(fn) {
    const arr = this
    let result = false
    for (let i = 0; i < arr.length; i++) {
      result = fn(arr[i], i, arr)
      if (result) {
        break
      }
    }
    return result
  }
```

## reduce

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

## for...of 手写迭代器接口 Symbol.iterator

Symbol.iterator 在语言层面提供了实现迭代器模式的通用可行性。

for...of 可以 break

```js
const obj = {
  store: ['a', 'b', 'c'],
  [Symbol.iterator]() {
    let index = 0
    return {
      next: () => {
        return {
          value: this.store[index++],
          done: index > this.store.length
        }
      }
    }
  }
}

for (const it of obj) {
  console.log('娃哈哈', it)
}
// 娃哈哈 a
// 娃哈哈 b
// 娃哈哈 c
```

使用 generator 版本

```js
const obj = {
  store: ['a', 'b', 'c'],
  [Symbol.iterator]: function*() {
    for (const item of this.store) {
      yield item
    }
  }
}

for (const it of obj) {
  console.log('娃哈哈', it)
}
// 娃哈哈 a
// 娃哈哈 b
// 娃哈哈 c
```

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
const flowRight = (...args) => value =>
  args.reverse().reduce((initVal, current) => current(initVal), value)

const fi = arr => arr[0]
const re = arr => arr.reverse()
const tu = str => str.toUpperCase()

const a = ['t', 'r', 'y']

console.log(flowRight(tu, fi, re)(a))

// 组合中若想查看哪个函数出错了也可以自己写个 log 函数

const log = tag => val => {
  console.log(val)
  return val
}

flowRight(tu, log, fi, log, re)(a)
```

## lodash.flow

flow 参数从左往右开始调用

```js
const flowRight = (...args) => value =>
  args.reduce((initVal, current) => current(initVal), value)

const fi = arr => arr[0]
const re = arr => arr.reverse()
const tu = str => str.toUpperCase()

const a = ['t', 'r', 'y']

console.log(flowRight(re, fi, tu)(a))
```

## 手写 new

new 做了哪些工作：

1. 创建对象；
2. 绑定原型；
3. 处理内部 this 指向；
4. 返回对象。

```js
function objectFactory(constructor) {
  const obj = myOc(constructor.prototype)
  // 绑定属性，处理 this 指向
  const res = constructor.apply(obj, Array.prototype.slice.call(arguments, 1))
  if (typeof res === 'object' || typeof res === 'function') {
    return res
  }
  return obj
}
// Object.create 传入一个对象，作为返回结果的 __proto__
// Object.create 的实现
function myOc(p) {
  // 建立中间函数
  const temp = function() {}
  // 获取原型
  temp.prototype = p
  // 创建对象 这里使用 new 来模拟 Object.create ，这在 new 中感觉有点尴尬，下面使用新的方式
  const obj = new temp()
  return obj
}

function Foo(a) {
  this.a = a
}

console.log(new Foo('123'))
console.log(objectFactory(Foo, '123'))

// Foo { a: '123' }
// Foo { a: '123' }
```

```js
// Object.create 的实现
function myOc(o, p) {
  Object.setPrototypeOf(o, p)
  return o
}

function myNew(constructor) {
  const o = {}
  myOc(o, constructor.prototype)
  const res = constructor.apply(o, Array.prototype.slice.call(arguments, 1))
  if (typeof res === 'object' || typeof res === 'function') {
    return res
  }
  return o
}
```

## 手写发布订阅模式

发布订阅模式，松耦合

[资料](https://zhuanlan.zhihu.com/p/51357583)

```js
// 发布订阅模式的事件中心
class EventCenter {
  constructor() {
    // 建立事件的键值对映射，可能会有同个事件key注册多个事件回调，所以需要使用数组当值
    this.sub = {}
  }
  // 注册事件
  $on(event, handler) {
    this.sub[event] = this.sub[event] || []
    this.sub[event].push(handler)
  }
  // 监听事件
  $emit(event, args) {
    this.sub[event].forEach(handler => {
      handler(args)
    })
  }
}

const ec = new EventCenter()

ec.$on('click', a => console.log(a))
ec.$on('click', a => console.log(a))

ec.$emit('click', 'hello world')
```

## 手写观察者模式

观察者模式，紧耦合

[资料](https://zhuanlan.zhihu.com/p/51357583)

```js
// 被观察对象
class Dep {
  constructor() {
    // 观察者列表
    this.subs = []
  }
  // 添加观察者
  addSubs(watcher) {
    if (watcher && watcher.update) {
      this.subs.push(watcher)
    }
  }
  // 事件发生时通知观察者进行处理
  notify() {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}

// 观察者
class Watcher {
  constructor() {}
  // 事件发生时的处理方法
  update() {
    console.log('update')
  }
}

const dep = new Dep()
const watcher = new Watcher()

dep.addSubs(watcher)
dep.notify()
```

## 手写 promise

[promise](https://dxxxxxxww.github.io/blog/js/javascript/手写promise.html)
