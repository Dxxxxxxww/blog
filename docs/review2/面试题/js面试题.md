# js 面试

## 类型

ES 有 7 种基本类型和 1 种引用类型

基本类型：

1. number
2. string
3. boolean
4. symbol
5. bigint
6. null
7. undefined

引用类型：

object：array，function 等等

### 判断数据类型的方式有哪些？

- typeof 主要用于判断基本类型，无法区分对象数组，对函数返回 'function'，对 null 返回 'object'
- instanceOf 判断 a 是否为 b 的实例，原理是通过原型链来判断的。
- Object.prototype.toString 最常用的方法
- Object() 判断是否为引用类型
- constructor 不推荐。 null undefined 没有

### Object.prototype.toString

```js
Object.prototype.toString.call('') // [object String]
Object.prototype.toString.call(1) // [object Number]
Object.prototype.toString.call(true) // [object Boolean]
Object.prototype.toString.call(Symbol()) //[object Symbol]
Object.prototype.toString.call(undefined) // [object Undefined]
Object.prototype.toString.call(null) // [object Null]
Object.prototype.toString.call(new Function()) // [object Function]
Object.prototype.toString.call(new Date()) // [object Date]
Object.prototype.toString.call([]) // [object Array]
Object.prototype.toString.call(new RegExp()) // [object RegExp]
Object.prototype.toString.call(new Error()) // [object Error]
Object.prototype.toString.call(document) // [object HTMLDocument]
Object.prototype.toString.call(window) //[object global] window 是全局对象 global 的引用
```

### 手写 instanceOf

```js
function myInstanceOf(o, c) {
  if (typeof o !== 'object') {
    return false
  }
  while (o) {
    if (o === c.prototype) {
      return true
    }
    // 或者使用 Object.getPrototypeOf(obj)
    o = o.__proto__
  }
  return false
}

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

### 实现一个深拷贝

```js
// 普通版
function deepClone(target, map = new WeakMap()) {
  if (!target) {
    return null
  }
  let res
  if (map.get(target)) {
    return target
  }
  if (typeof target === 'object') {
    map.set(target, true)
    if (Array.isArray(target)) {
      res = []
      target.forEach((v, i) => {
        res[i] = deepClone(v, map)
      })
    } else {
      res = {}
      Object.keys(target).forEach((k) => {
        res[k] = deepClone(target[k], map)
      })
    }
    return res
  } else {
    return target
  }
}

const a = { a: { a: 'a' } }
a.b = a

const c = [1, 2]
c[2] = c

console.log(deepClone(a), deepClone(c))
```

## 原型及原型链

概念太熟悉了，直接过了过了

## this

**web:**

普通函数在调用时确立 this 指向。

普通函数：

- 在独立调用时，this 指向 window，严格模式下指向 undefined
- 作为对象方法调用，指向对象
- 通过 call/apply/bind 来调用，指向传入的对象

  - 多次 call/apply 都指向当时传入的对象，多次 bind 无效，指向第一次 bind 的传参，原因是闭包
  - call/apply/bind 传入 null/undefined 指向 window，传入基本类型则指向基本类型包装后的对象

箭头函数：

- 箭头函数在定义时确立 this 指向，指向其父级作用域的 this
- call/apply/bind 无法改变箭头函数 this 指向

**node:**

node 的模块其实就是一个函数，类似于 fn.call(module.exports)。

- 在模块中直接输出 this，指向 module.exports
- 在模块中调用箭头函数，this 指向 module.exports
- 在模块中调用函数，指向全局的 global

### 手写 new

```js
function myNew(c) {
  const obj = Object.create(c.prototype)
  const res = c.call(obj)
  return typeof res === 'object' || typeof res === 'function' ? res || obj : obj
}
```

### 手写 Object.create

```js
function ObjectCreate(pt) {
  function fn() {}
  fn.prototype = pt
  return new fn()
}

function ObjectCreate2(pt) {
  const obj = {}
  Object.setPrototypeOf(obj, pt)
  return obj
}
```

### 手写实现 call apply bind

```js
function myCall3(target, ...args) {
  const prarms = []
  for (let i = 0; i < args.length; i++) {
    prarms[i] = `args[${i}]`
  }
  target.fn = this
  const result = eval(`target.fn(${params})`)
  delete target.fn
  return result
}

function myCall6(target, ...args) {
  target.fn = this
  const res = target.fn(...args)
  delete target.fn
  return res
}

function myApply3(target, ...args) {
  target.fn = this
  const params = []
  for (let i = 0; i < args.length; i++) {
    params[i] = `args[${i}]`
  }
  const res = eval(`target.fn(${params})`)
  delete target.fn
  return res
}

function myApply6(target, ...args) {
  target.fn = this
  const res = target.fn(...args)
  delete target.fn
  return res
}

function myBind(target, ...args1) {
  const fn = this
  const newFunc = function (...args2) {
    const params = [...args1, ...args2]
    fn.apply(this instanceof newFunc ? this : target, params)
  }
  // 避免影响到原始父类
  newFunc.prototype = Object.create(fn.prototype)
  return newFunc
}
```

### ES5 实现继承

```js
function Parents() {
  this.name = 'Parents'
}

Parents.prototype.sayName = function sayName() {
  console.log(this.name)
}

function Child(...args) {
  Parents.apply(this, args)
}

Child.prototype = Object.create(Parent.prototype)
Child.prototype.constructor = Child
```

## 闭包

闭包就是一个函数内部使用了不属于这个函数作用域内的变量。从这个定义出发，如果我们一个函数使用了全局变量，其实也算是一种"广义上的闭包"。但是我们大部分时候讨论的还是狭义上的闭包，也就是子级函数使用了父级函数作用域中的变量，这样一来，当父级函数调用结束，从执行上下文栈中移除，而子级函数还保留着父级作用域变量的引用，导致变量不能被垃圾回收，形成了闭包。

并不一定要子级函数作为返回值返回出去，在外部调用才算闭包，在父级函数内部调用，也算是闭包。

### 闭包形成原理

在 js 中，当函数执行生成上下文（此时内部代码还没有真正开始执行），引擎会对内部代码进行扫描，发现函数内部还有函数，并且引用了外部函数的变量，就会判断这是一个闭包，会在内存中额外开辟一个闭包空间来存放引用的变量。父级，子级函数都会持有这个闭包空间的引用。

### 闭包的作用

1. 缓存
2. 防抖节流
3. 私有变量
4. 早期模块化，iife + 闭包

### 闭包会导致内存泄漏吗

闭包本身不会，但使用不当就会

## var let const 的区别

let const 所声明的变量与 var 声明的变量不存储同一个变量对象上。

## promise

手写 promise，这里太长就不写了。

相关的异步同步手写题查看 js/code/promise

## eventloop

由于 js 是单线程的，要处理好多任务的并发，就需要一个系统来进行控制处理，这个系统就叫做 eventloop。

eventloop = 一个执行器 + 多个消息队列

### 微任务和宏任务的区别

微任务是 js 语言层面上实现的，从浏览器的角度来说只有宏任务（task）。像浏览器的任务执行（解析 html，渲染页面等等），js 代码执行都是宏任务。只不过 js 中有一些函数是属于微任务。

微任务：

- promise
- mutationObserver
- queueMicrotask
- process.next（node 独有，在微任务中优先级最高）

### 为什么要有微任务？

为了在不同的宏任务之间插入一些优先级较高的任务。两个 js 宏任务之间的执行，可能会被浏览器插入其他任务执行，而导致后面的 js 宏任务迟迟得不到执行。

[vue 的 nextTick 优先使用微任务来执行也是这个原因。](https://github.com/vuejs/vue/issues/3771)

### node 环境中的 eventloop

低版本的 node 环境下的 eventloop 与 web 环境下不同，高版本已经一致。低版本 node 环境下的 微任务执行是在 node 切换任务队列时才去执行。

### vue 中的 nextTick，为什么可以直接拿到修改后的 dom

nextTick 是微任务，照理说会在当前 js 这个 task 中执行，而页面渲染是下一个 task。这是为什么？

因为 dom 改变是同时的，而页面渲染才要等到下一个 task，这俩是区分开的。

测试案例在 vue-music/recommend 里。

## 防抖节流

```js
function debounce(fn, time, immediate) {
  let timer
  return function (...args) {
    const ctx = this
    if (immediate) {
      fn.apply(ctx, args)
      // 需要置为 false 否则之后每次都会立即执行
      immediate = false
    }
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(ctx, args)
    }, time)
  }
}

function throttle(fn, time, immediate) {
  let timer
  return function (...args) {
    const ctx = this
    if (immediate) {
      fn.apply(ctx, args)
      // 需要置为 false 否则之后每次都会立即执行
      immediate = false
    }
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      fn.apply(ctx, args)
      clearTimeout(timer)
      timer = null
    }, time)
  }
}
```

## v8

### v8 内存大小限制以及为什么要这样限制

64 位下 新生代 32m 老生代 1.4g

32 位下 新生代 16m 老生代 0.7g

限制原因？

1. 约 1.5g 的内存已经够浏览器中的 js 使用了
2. 耗时问题，1.5g 的内存空间进行一次垃圾回收约 50ms，进行一次非增量回收则需要 1s 以上，影响用户体验。

### v8 使用了哪些垃圾回收算法

- 复制算法
- 引用计数
- 标记清除
- 标记整理
- 增量标记，增量标记后续还有再发展

### 说一说这几种垃圾回收算法的缺点在哪里
