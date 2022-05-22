---
sidebar: auto
---

# JavaScript 深入篇

## 冴羽大佬博客学习笔记

因为是笔记摘抄，所以不打算分开成各个章节。[冴羽博客](https://github.com/mqyqingfeng/Blog)

## 一、原型链

```js
Object.prototype.a = 1

const obj = {}

console.log(obj.a) // 1
```

前提概念 1：每个对象都会有构造函数，对象与构造函数的联系就是：

```js
obj.__proto__ === Obj.prototype
```

如上述代码，当一个对象(obj)去访问一个属性(a)时，如果在对象自身上访问不到，就会沿着

## 二、作用域

作用域是指程序源代码中定义变量的区域。<br/>
作用域规定了如何查找变量，也就是确定当前执行代码对变量的访问权限。<br/>

### JavaScript 词法作用域（静态作用域）

JavaScript 是一门采用静态作用域的语言。事实上，大部分语言采用的都是静态作用域。<br/>

1. 静态作用域：就是指函数的作用域在函数定义的时候就决定了。
2. 动态作用域：作用域在函数调用的时候就决定。

## 三、执行上下文栈

### JavaScript 代码分段执行

js 代码是一段一段分析执行的。这一段一段是根据什么划分的呢？它是根据可执行代码划分的。<br/>
可执行代码一共就 3 个：全局代码，函数，eval。<br/>
每当执行一个函数，就会做一些“准备工作”，这个“准备工作”就叫做**执行上下文(execution context)**。每个函数执行都会创建执行上下文，为了管理这些执行上下文，JavaScript 引擎创建了**执行上下文栈（Execution context stack，ECS）**。<br/>
执行上下文包括以下三个部分：

1. 变量对象；
2. 作用域链；
3. this。

## 四、变量对象(VO，variable object)

**定义：变量对象是与执行上下文相关的数据作用域，存储了在上下文中定义的变量和函数声明。**

对于全局来说，变量对象就是全局对象，也就是 window。
而对于函数来说，变量对象在函数进入执行上下文的那一刻，VO 就激活变成 AO (active object)了。
函数的 VO 是以 arguments 为基础创建的。
个人认为函数的变量对象经过了以下的变化

```js
function foo(a) {
  var b = 2;
  function c() {}
  var d = function() {};

  b = 3;
}

foo(1);
// foo 在全局对象中定义的时候，就已经通过函数的 arguments 属性初始化。
VO = {
  arguments: {
    0: undefined,
    length: 1
  },
}
// 当 foo 进入执行上下文的那一刻。此时还在分析阶段，还没有进行赋值，所以都是声明时的初始值。
// 1.函数的形参声明；2.函数声明；3.变量声明。
// 这一步将活动对象压入作用域链顶端
AO = {
  arguments: {
    0: undefined,
    length: 1
  },
  a: undefined,
  b: undefined,
  c: reference to function c(){}, // 函数声明的时候是否已经引用了函数呢？还是 undefined？找不到资料。但是冴羽大佬认为是已经引用了的。
  d: undefined
}
// 当函数真正执行的时候，这时候进行赋值。
AO = {
  arguments: {
    0: 1,
    length: 1
  },
  a: 1,
  b: 3,
  c: reference to function c(){},
  d: reference to FunctionExpression "d"
}
```

## 五、作用域链

当查找变量的时候，会先从当前上下文的变量对象中查找，如果没有找到，就会从父级(词法层面上的父级)执行上下文的变量对象中查找，一直找到全局上下文的变量对象，也就是全局对象。<br/>
**定义：这样由多个执行上下文的变量对象构成的链表就叫做作用域链。**

### 作用域链形成的过程

在全局代码执行的时候，变量对象中就已经有了全局的变量、函数等属性。**所以说函数的作用域在函数定义的时候就决定了**。对于函数来说，此时它的作用域链中已经包含了全局对象。当函数激活时，进入函数上下文，创建 VO/AO 后，就会将活动对象添加到作用链的头部。

函数创建的时候，保存作用域链（此时还不是完整的作用域链）到内部属性[[scope]]，当此执行的时候，会**复制**函数[[scope]]属性创建作用域链，作为自己作用域链的初始化，然后根据环境生成变量对象，**然后将这个变量对象，添加到这个复制的作用域链头部，这才完整的构建了自己的作用域链**。至于为什么会有两个作用域链，是因为在函数创建的时候并不能确定最终的作用域的样子。为什么会采用复制的方式而不是直接修改呢？应该是因为函数会被调用很多次吧。

## 六、this

普通函数的 `this` 是在调用时（创建执行上下文）确定的，而箭头函数的 `this` 是捕获函数所在的上下文的 `this`，在定义时就确定了。

`this` 指向的深层原因还是直接看冴羽大佬的博客吧，笔记感觉也做不了啥。
[戳这里](https://github.com/mqyqingfeng/Blog/issues/7)

### 日常使用时 `this` 的指向

js 中调用函数一般会有以下 4 中情况：

1. 函数独立调用，在非严格模式下，`this` 指向 window，严格模式下指向 undefined。

```js
var a = 1
function fun() {
  return this.a
}
console.log(fun()) // 1
```

2. 作为对象的方法调用，`this` 指向对象。

```js
var a = 1
var obj = {
  a: 2,
  b: function() {
    return this.a
  }
}
console.log(obj.b()) // 2
```

3. `call/apply/bind` 调用，指向传入的对象。注意：当入参是 `null/undefined` 时，`this` 仍然指向 `window`。当入参是基本类型值时，会隐式转换成对应类型的对象。

```js
var obj = {
  a: 2
}
var a = 10
function b() {
  console.log(this.a)
}
console.log(b()) // 10
console.log(b.call(obj)) // 2
```

4. 作为构造函数调用，指向 `new` 出来的对象。注意：如果构造函数中返回了其他对象，`this` 会指向其他对象。如果 `return null/undefined/基本类型值` ，`this` 还是会指向新建的对象。

```js
var a = 10
function Parent() {
  this.a = 20
}
var p = new Parent()
console.log(p.a) // 20
```

函数的 `this` 指向还有一种额外情况，那就是箭头函数。对于箭头函数来说，它的 `this` 是在它定义的时候就决定了的。它的 `this` 指向它的父级执行上下文环境的 `this`。

```js
function fun() {
  let a = 1
  const b = () => {
    console.log(this)
  }
  b()
}
fun() // window
```

这里应该会有个问题就是，箭头函数的 `this` 在定义的时候确定，普通函数的 `this` 在调用时确认，那函数里的箭头函数的 `this`，如果外层函数不调用，岂不是一直不确认了？

其实不是的，也会是在定义的时候确认，只不过 `this` 指向是一种类似内存存储对象(栈存地址，对象本身存堆)的引用关系。

```js
const obj = {
  hello: 'hello'
}

function fun() {
  let a = 1
  const b = () => {
    console.log(this)
  }
  b()
}
fun.call(obj) // { hello: 'hello' }
```

———

至于更加复杂的情况，就需要看[冴羽大佬的博客](https://github.com/mqyqingfeng/Blog/issues/7)了，比如说：

```js
var value = 1

var foo = {
  value: 2,
  bar: function() {
    return this.value
  }
}

console.log((foo.bar = foo.bar)()) // 1
console.log((false || foo.bar)()) // 1
console.log((foo.bar, foo.bar)()) // 1
```

### `bind` 的注意事项

多次 bind

需要注意的是 `bind` 多次调用无效，是因为闭包保存了首次的入参 **(this 和 其余参数)**。

这也是因为 bind 实际上是给原始函数封装了一层，原函数是以 首次入参为 `this` 来调用的。

多次 `bind` 只是多次封装，最终调用的函数还是原来的那个函数。

![image](/js/bind-1.jpg)
![image](/js/bind-2.jpg)

## 七、执行上下文过程

```js
var scope = 'global scope'
function checkscope() {
  var scope = 'local scope'
  function f() {
    return scope
  }
  return f
}
checkscope()()
```

**执行过程：**

1. **全局上下文入栈。**

```js
stack = [globalContext]
```

1.1 **创建全局执行上下文，全局执行上下文初始化，全局代码执行。**

```js
globalContext = {
  VO: {
    scope: undefined,
    checkscope: reference to function checkscope(){}
  },
  SCOPE: [global],
  this: global,
}
```

1.2 **全局上下文初始化的同时，函数 checkscope 创建，绑定父级作用域到自身的 [[scope]] 属性。**

```js
checkscope.[[scope]] = [globalContext.VO]
```

2. **函数 checkscope 入栈。**

```js
stack = [checkscopeContext, globalContext]
```

2.1 **创建函数执行上下文，函数上下文初始化，函数 checkscope 执行。**<br/>
(1) 复制 [[scope]] 属性创建作用域链；<br/>
(2) 通过 arguments 创建活动对象；<br/>
(3) 初始化活动对象，加入形参，函数声明(f 函数被创建，保存作用域链到 f 函数的内部属性 [[scope]])，变量声明；<br/>
(4) 将活动对象压入作用域链首部；<br/>
(5) 确定 this 指向。

```js
checkscopeContext = {
  AO: {
    arguments: {
      length: 0
    },
    scope: undefined,
    f: reference to function f(){}
  },
  SCOPE: [AO, globalContext.VO],
  this: undefined
}
```

2.2 **函数 checkscope 执行完出栈。**

```js
stack = [globalContext]
```

3. **函数 f 入栈。**
   过程同 2

## JS 单线程

JS 设计初衷是放在浏览器中执行的，为了保证 dom 操作不会冲突。所以它的执行环境中负责执行 js 代码 的线程只有一个。

[link](https://juejin.cn/post/6844903553795014663)

## Promise

### Promise 的注意事项

对于 promise 来说，值只有两种情况，是 promise，不是 promise。如果是 promise 会使用 then 进行状态判断，如果不是 promise 就直接 resolve 了(即便是一个 Error 对象)。

```js
const p2 = new Promise((resolve, reject) => {
  // resolve("成功222");
  reject('失败2233')
})

p2.then('', err => {
  console.log(err)
  // throw new Error('456') // 输出 errorLo:::: Error: 456
  return new Error('456') // 输出 hahaha Error: 456
}).then(
  val => {
    console.log('hahaha', val)
  },
  err => {
    console.log('errorLo::::', err)
  }
)
```

```js
axios('/api').then(
  res => {
    throw new Error('异常A')
    // return axios('/api/error') // 这个新的 promise 所产生的异常，then 的第二个参数是捕获不到的
  },
  err => {
    // then 的第二个参数 => catch函数，只能捕获到当前 promise 出现的异常
    // 如果在当前的 promise 中返回了一个新的 promise，并且这个 promise 报错了，这里是无法捕获到的
  }
)

axios('/api')
  .then()
  .catch(err => {
    // 而使用这种方法是全都可以捕获到(当然 catch 中又报错了的话那自然是捕获不到的)
  })
```

### Promise 的实用案例

1. 并行请求

```js
const urls = ['/api/getInfo', '/api/getUser']

// 返回一个 promise 数组
Promise.all(urls.map(item => axios(item))).then(valList => {
  console.log(valList)
})
```

2. 限制请求时长

```js
const getInfo = axios('/api/getInfo')
const timeout = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('timeout')), 5000)
})

Promise.race([getInfo, timeout])
  .then(val => {
    console.log(val)
  })
  .catch(err => {
    console.log(err)
  })
```

## EventLoop

[可以查看 eventloop 过程](https://www.jsv9000.app/)

**注意：代码中不能有中文**

[最后一次搞懂 Event Loop](https://juejin.cn/post/6844903827611598862)

[Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)

**在不同的浏览器下，甚至是同一种浏览器的不同版本中，异步任务的执行顺序都会有差异，也就是说他们的优先级并不是完全固定的。**

**注意，只是异步任务的优先级会有所不同，这主要还是各个浏览器的问题。**

**所以 winter 也说了这种题作为面试题极为不合适。**

[学习资料 1](https://juejin.cn/post/6844903827611598862#heading-19)

[学习资料 2](https://juejin.cn/post/6844903553795014663#heading-21)

### 一、promise

#### 2021/11/06 更新：详细的执行过程可以用[链接](https://www.jsv9000.app/)查看

```js
var p1 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('a')
})
  .then(val => {
    console.log('then11', val)
    new Promise((resolve, reject) => {
      console.log('promise2')
      resolve('b')
    })
      .then(val => {
        console.log('then21', val)
        return 'c'
      })
      .then(val => {
        console.log('then23', val)
        Promise.resolve()
          .then(() => {
            console.log('then23里的 then')
            return 'd'
          })
          .then(val => {
            console.log('then24', val)
            return 'e'
          })
        return 'f'
      })
      .then(val => {
        console.log('then25', val)
        return 'g'
      })
    return 'z'
  })
  .then(val => {
    console.log('then12', val)
  })

// 输出
// promise1
// then11 a
// promise2
// then21 b
// then12 z
// then23 c
// then23里的 then
// then25 f
// then24 d

// 这里的 then23，then23里的 then，then25 是同一轮微任务
```

```js
var p2 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('a')
})
  .then(val => {
    console.log('then11', val)
    new Promise((resolve, reject) => {
      console.log('promise2')
      resolve('b')
    })
      .then(val => {
        console.log('then21', val)
        return 'c'
      })
      .then(val => {
        console.log('then23', val)
        return Promise.resolve()
          .then(() => {
            console.log('then23里的 then')
            return 'd'
          })
          .then(val => {
            console.log('then24', val)
            return 'e'
          })
      })
      .then(val => {
        console.log('then25', val)
        return 'f'
      })
      .then(val => {
        console.log('then26', val)
        return 'g'
      })
    return 'z'
  })
  .then(val => {
    console.log('then12', val)
  })

// 输出
// promise1
// then11 a
// promise2
// then21 b
// then12 z
// then23 c
// then23里的 then
// then24 d
// then25 e
// then26 f
// 这里的 then23，then23里的 then 是同一轮微任务
// then24 是下一轮
// then25 由于 return 新的 promise 的原因变为 下下轮
```

上面两段代码的唯一区别是 <code>then23 里的 then</code> 这一个 <code>promise</code> 是否 <code>return</code>。这里其实是 <code>promise</code> 的特性：**如果在 '当前 then' 中手动返回一个新的 promise 则会使紧跟着 '当前 then' 之后的 '后 then' 拼接到 '新 Promise 的 then' 末尾（在本代码中指 then25 拼接到 then24 之后）。（个人理解）进入到下一轮 微任务中，而不是本轮。**

```js
var p2 = new Promise((resolve, reject) => {
  console.log('promise1')
  resolve('a')
})
  .then(val => {
    console.log('then11', val)
    return new Promise((resolve, reject) => {
      console.log('promise2')
      resolve('b')
    })
      .then(val => {
        console.log('then21', val)
        return 'c'
      })
      .then(val => {
        console.log('then23', val)
        return Promise.resolve()
          .then(() => {
            console.log('then23里的 then')
            return 'd'
          })
          .then(val => {
            console.log('then24', val)
            return 'e'
          })
      })
      .then(val => {
        console.log('then25', val)
        return 'f'
      })
      .then(val => {
        console.log('then26', val)
        return 'g'
      })
  })
  .then(val => {
    console.log('then12', val)
  })

// 输出
// promise1
// then11 a
// promise2
// then21 b
// then23 c
// then23里的 then
// then24 d
// then25 e
// then26 f
// then12 g
// 同理，then12 变为最后一轮
```

## 闭包中的变量存储在哪里？

先说结论：闭包所引用的变量会存到堆中。

原因：栈中的变量在函数调用结束后，就会消失。而堆中的内存会被 GC 统一回收，如果变量一直有引用，则不会回收。

闭包产生后，会将闭包引用的变量放在堆中一个叫 Closure(闭包) 的对象中。而这个 Closure 也会插入到作用域链的顶层。

```js
function makeStevenFunc() {
  var stevenx911_name = new Array(1000000).join('x') //这里通过数组构造一个1MB大小字符串

  function displayStevenName() {
    // 这里定义一个具名函数，方便我们查找
    console.log(stevenx911_name)
  }
  return displayStevenName
}

var myFunc = makeStevenFunc()
myFunc()
```

在浏览器的 memory 中可以查看到堆内存的使用情况，如图：

![image](/js/heep-memory.png)

var 声明的函数(引用类型)也在堆中。这是正常的，因为 window 是一个对象，自然在堆里。

![image](/js/heep-memory2.png)

作用域链如图：

![image](/js/heep-scope.png)

[资料 1](https://juejin.cn/post/6887054571080777735)

[资料 2](https://juejin.cn/post/6844903997615128583#comment)

## promise

如果在一个 promise 中返回了一个新的 promise，那么被返回的这个 promise 会延后两个微任务之后执行。

## 页面加载事件

document.DOMContentLoaded: 事件在初始 HTML 文档完全加载和解析之后触发，而不需要等待样式表、图像和子帧完成加载。

window.load: 当整个页面已经加载时，包括所有相关资源(如样式表和图像) ，将触发加载事件。这与 DOMContentLoaded 形成了对比，DOMContentLoaded 在页面 DOM 加载完成后立即启动，而不需要等待资源完成加载。

## async/await in JavaScript loop in sequence 循环

先说结论，循环里需要使用 async/await 来保证串行的话，使用基本循环。

### 能保证串行的

[资料](https://zellwk.com/blog/async-await-in-loops/)

3 种基本循环和 1 中需要回调的循环

1. for；
2. for...of;
3. while;
4. reduce。

reduce 中会有很奇怪的表现。

```js
const reduceLoop = async _ => {
  console.log('Start')

  const sum = await fruitsToGet.reduce(async (sum, fruit) => {
    const numFruit = await getNumFruit(fruit)
    // 原因是 async 的函数，总是返回 promise，所以第一次遍历完返回，返回值就变成了 Promise.resolve(sum + numFruit)
    // 也就是 Promise.resolve(0 + 27)
    // async 定义： async函数内部return语句返回的值，会成为then方法回调函数的参数。async函数内部抛出错误，会导致返回的 Promise 对象变为reject状态。抛出的错误对象会被catch方法回调函数接收到。
    // 也就是说，正常返回是 resolve，报错是 reject
    return sum + numFruit
  }, 0)

  console.log(sum)
  console.log('End')
}

reduceLoop()
// 'Start'
// '[object Promise]14'
// 'End'

// 所以在 reduce 中使用，需要 await 一下

// 据说这种写法会卡着很慢，但在最新版 chrome 中没有体现。
//  This happens because reduceLoop needs to wait for the promisedSum to be completed for each iteration.
// 这是因为 reduceLoop 需要等待每个迭代完成承诺的和。
const reduceLoop = async _ => {
  console.log('Start')

  const sum = await fruitsToGet.reduce(async (promisedSum, fruit) => {
    // 注意这一步，上一次循环的结果求值
    const sum = await promisedSum
    const numFruit = await getNumFruit(fruit)
    return sum + numFruit
  }, 0)

  console.log(sum)
  console.log('End')
}
// 这种比上面一种会执行快一点，不会卡顿很久，但是也会有问题。所以最好的方式还是使用基本循环。
const reduceLoop = async _ => {
  console.log('Start')

  const sum = await fruitsToGet.reduce(async (promisedSum, fruit) => {
    // Heavy-lifting comes first.
    // This triggers all three `getNumFruit` promises before waiting for the next interation of the loop.
    // This works because reduce can fire all three getNumFruit promises before waiting for the next iteration of the loop. However, this method is slightly confusing since you have to be careful of the order you await things
    // 这是因为 reduce 可以在等待循环的下一次迭代之前激发所有三个 getNumFruit promise。但是，这个方法有点令人困惑，因为您必须小心等待事物的顺序。
    const numFruit = await getNumFruit(fruit)
    const sum = await promisedSum
    return sum + numFruit
  }, 0)

  console.log(sum)
  console.log('End')
}
```

### 不能保证串行的

需要回调的循环，猜测是内部实现没有给传入的回调前加上 await，这也是正常的，除非有参数控制，不然直接加上太傻了。

1. forEach;
2. map;
3. filter。

---

forEach：不支持 async/await, promise；

```js
const fruitBasket = {
  apple: 27,
  grape: 0,
  pear: 14
}

const fruitsToGet = ['apple', 'grape', 'pear']

const getNumFruit = fruit => {
  return fruitBasket[fruit]
}

const forEachLoop = _ => {
  console.log('Start')

  fruitsToGet.forEach(async fruit => {
    const numFruit = await getNumFruit(fruit)
    console.log(numFruit)
  })

  console.log('End')
}
// 'Start'
// 'End'
// '27'
// '0'
// '14'
```

map：总是返回 promise 组成的数组。可以根据这种行为，在外层用 Promise.all() 来包裹，并行执行；

```js
const mapLoop = async _ => {
  console.log('Start')

  const numFruits = await fruitsToGet.map(async fruit => {
    const numFruit = await getNumFruit(fruit)
    return numFruit
  })

  console.log(numFruits)

  console.log('End')
}

// 'Start'
// '[Promise, Promise, Promise]'
// 'End'

const mapLoop = async _ => {
  console.log('Start')

  const promises = fruitsToGet.map(async fruit => {
    const numFruit = await getNumFruit(fruit)
    return numFruit
  })

  const numFruits = await Promise.all(promises)
  console.log(numFruits)

  console.log('End')
}

// 'Start'
// '[27, 0, 14]'
// 'End'

const mapLoop = async _ => {
  // ...
  const promises = fruitsToGet.map(async fruit => {
    const numFruit = await getNumFruit(fruit)
    // Adds onn fruits before returning
    return numFruit + 100
  })
  // ...
}

// 'Start'
// '[127, 100, 114]'
// 'End'
```

filter：总是不能获得期望的效果，因为 promise 是一个“真值”，在 filter 的判断下总是会返回 true；

```js
const filterLoop = async _ => {
  console.log('Start')

  const moreThan20 = await fruitsToGet.filter(async fruit => {
    const numFruit = await getNumFruit(fruit)
    return numFruit > 20
  })

  console.log(moreThan20)
  console.log('End')
}

// 'Start'
// ['apple', 'grape', 'pear']
// 'End'

// 上面代码其实是这样的
const filtered = array.filter(() => true)

// 正确使用 filter 需要与 map 搭配
const filterLoop = async _ => {
  console.log('Start')
  // 先用 map 包装
  const promises = await fruitsToGet.map(fruit => getNumFruit(fruit))
  // 在用 Promise.all 求值
  const numFruits = await Promise.all(promises)
  // 最后对值进行过滤
  const moreThan20 = fruitsToGet.filter((fruit, index) => {
    const numFruit = numFruits[index]
    return numFruit > 20
  })

  console.log(moreThan20)
  console.log('End')
}
// Start
// [ 'apple' ]
// End
```
