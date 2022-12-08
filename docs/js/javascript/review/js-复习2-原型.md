# 原型，原型链

## 原型对象

原型是一种 js 对象。一个 js 普通对象的 __proto__ 和构造函数的 prototype 指向的对象就叫原型对象。

## 原型链

实例对象的 __proto__ 指向其构造函数的 prototype 所指向的原型对象，而原型对象也是对象，它的 __proto__ 也会指向其构造函数(Object)的 prototype 所指向的原型对象，这样形成的链就叫原型链。

## Object Function

Object 如果作为对象，其 __proto__ 指向构造函数 Function 的 prototype 所指向的原型对象。

Object 如果作为函数，其 prototype 指向 Object 的 prototype 所指向的原型对象。

Function 不管是作为对象还是函数，其 __proto__ 和 prototype 所指向的是相同的对象。

## 相关面试题

### 手写 new

```js
function myNew(c) {
  // 建立原型链
  const obj = Object.create(c.prototype);
  // 绑定私有属性并获取返回值
  const res = c.call(obj)
  return typeof res === 'object' || typeof res === 'function' ? res : obj
}

```

### 手写 Object.create

```js
function objectCreate1(p) {
    const obj = {}
    Object.setPrototypeOf(obj, p);
    return obj
}

function objectCreate2(p) {
    function tmp() {}
    tmp.prototype = p
    return new tmp();
}
```
