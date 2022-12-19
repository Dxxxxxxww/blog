# 一、JS 复习之类型

## 类型

在 js 中，主要分为两大类型：

1. 基本类型
2. 引用类型

### 基本类型

基本类型有七类，包括：

1. number
2. string
3. boolean
4. null
5. undefined
6. symbol
7. bigint

### 引用类型

引用类型主要是对象，可细分为：

1. object
2. array
3. date
4. function
5. 等等...

## 区分基本类型和引用类型的方法

常见的区分手段有以下几种：

1. typeof
   1. typeof 无法细分引用类型
   2. 对 null 也会判断成对象。这是因为对 js 语言来说，数据是由类型标签和值组成，对象的标签是 0，而 null 代表的是空指针，也就是 0x00。null 的标签也为 0，因此 null 会被判断成是对象
2. Object.prototype.toString
   1. 对 es6 之后新增的类型来说，主要是取 Symbol.toStringTag 属性，对于之前的一些没有该属性的对象就是取其他特殊值（MDN 上没有详细解释），也不是取构造函数，毕竟 null 和 undefined 没有构造函数
   2. 没有部署 Symbol.toStringTag 属性的对象有：Array，Function（它的 typeof 返回 "function"），Error，Boolean，Number，String，Date，RegExp
   3. 部署了 Symbol.toStringTag 属性的有：JSON, Math, Atomics, BigInt, Symbol, Set, Map, WeakSet, WeakMap等等，具体可查看。https://zhuanlan.zhihu.com/p/118793721
3. instanceof
4. Object 包装函数
5. constructor 构造函数。xx.constructor === String

## 相关面试题
### 如何判断一个变量是否已经声明？

1. typeof
2. try...catch

### Number.isNaN 和 isNaN 的区别

isNaN 会对入参先进行隐式转换成 number 类型，如果转换后的结果是正常数字，则返回 false，否则返回 true。

而 Number.isNaN 不会进行饮食转换，如果入参是 NaN，才会返回 true

### js 数字存在精度问题，要怎么判断数字是否相等？

Number.EPSILON 常量表示 1 与大于 1 的最小浮点数之间的差，JavaScript 能够表示的最小精度

### 手写实现 instanceof

```js
function myInstanceof (t, c) {
   if (typeof t !== 'object') return false
   while (true) {
      if (!t) {
         return false;
      }
      if (t === c.prototype) {
         return true;
      }
      t = Object.getPrototypeOf(t)
   }
}

const s = new String('123')
const s2 = '123'

console.log(myInstanceof(s, String))
console.log(myInstanceof(s2, String))

console.log(s instanceof String)
console.log(s2 instanceof String)

```
