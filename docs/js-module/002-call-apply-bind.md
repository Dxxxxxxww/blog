# 手写之二 call apply bind

## 一、call

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
      c: 'ccc',
    },
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
console.log(test.call3(obj, 1, 2, 'c')) // 1 + ccc + 1 + 2 + c
console.log(test.call6(obj, 1, 2, 'c')) // 1 + ccc + 1 + 2 + c
```

## 二、apply

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
      c: 'ccc',
    },
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
console.log(test.apply3(obj, [1, 2, 'c'])) // 1 + ccc + 1 + 2 + c
console.log(test.apply6(obj, [1, 2, 'c'])) // 1 + ccc + 1 + 2 + c
```

## 三、bind

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
      c: 'ccc',
    },
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
      c: 'ccc',
    },
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
const value = 2

const foo = {
  value: 1,
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
      c: 'ccc',
    },
  }
function test(p1, p2, p3) {
  return `${this.a} + ${this.b.c} + ${p1} + ${p2} + ${p3}`
}
const value = 2

const foo = {
  value: 1,
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

## 四、总结：
call 和 apply 的实现其实是比较简单的，而且只要实现了 call，apply 也就实现了。bind 相较于 call 和 apply 难的地方在于需要考虑到 bind 的返回值作为构造函数的情况。
