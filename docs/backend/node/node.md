# node

因为 JS 为单线程语言，node 更适用于 I/O 密集型，而非 CPU 密集型。

适用场景：

1. BFF
2. 操作数据库，提供 api 服务
3. 实时聊天程序

## 全局对象和全局变量

全局对象：node 的全局对象是 global。但是 node 模块文件是一个包裹函数，this 指向的是 module.exports。

常见的全局变量：

1. \_\_filename：返回正在执行脚本文件的绝对路径
2. \_\_dirname：返回正在执行脚本文件所在的目录
3. time 类函数：setTimeout setInterval clearxxx
4. 事件循环相关函数：setImmediate nexttick
5. process: 提供与当前进程互动的接口。指向 node 内置的 process 模块
6. 模块导入导出相关：require module exports
7. Buffer：数据缓冲区

常见运行环境获取

```js
// 查看内存使用情况
console.log(process.memoryUsage())

{
  rss: 1, // 常驻内存大小，代表分配给 node 的内存大小。本机所有内存并非全给 node 使用的
  heapTotal: 1, // 当前总内存
  heapUsed: 1, // 当前已使用内存
  external: 1, // c++ 等 node 内置模块所占内存
  arrayBuffers: 1, // 缓冲区内存大小
}
// 查看 cpu 使用情况
console.log(process.cpuUsage())

{
  user: 1, // 用户占用 cpu 情况
  system: 1, // 系统占用 cpu 情况
}

console.log(process.env.USERPROFILE) // 获取用户管理员目录，不同平台字段不同，mac 下为 HOME
console.log(process.platform) // 获取用户操作系统平台 win mac
console.log(process.cwd()) // 当前运行目录
console.log(process.version) // node 版本
console.log(process.versions) // node 及内置模块版本
console.log(process.arch) // cpu 架构
```

常见运行状态获取

```js
console.log(process.argv) // 启动参数
console.log(process.execArgv) // 启动参数  -- 开头的
console.log(process.pid) // pid
console.log(process.uptime()) // 运行时间
```

这里有两个小知识：

```js
process.on('beforeExit', (code) => {
  console.log('before exit: ', code)
  // beforeExit 可以写异步代码
  setTimeout(() => console.log('before exit: ', code), 0)
})

process.on('exit', (code) => {
  // exit 中写异步代码无效，不会执行
  console.log('exit: ', code)
})

// 如果手动执行退出函数，beforeExit 注册事件不会执行。
process.exit()
```

## 内置模块

[api 集合](https://www.runoob.com/nodejs/nodejs-buffer.html)

### path

常用 path 模块在 <code>./node/path/path.js</code> 中

### Buffer

node 中的二进制数据操作。不占据 v8 的堆内存大小，是额外的内存空间，但内存使用由 v8 进行控制。一般配合 stream 流使用，充当数据缓冲区。

### fs 文件系统

flag r+ 和 w+ 的区别：

r+ 是对原本内容覆盖写入再读取。w+ 是清空原本内容再写入。

## 模块化

cmj 出现在 esm 之前，当时的语言本身并不支持模块化，并且当时的作用域只有全局和函数作用域。那么可想而知，cmj 实现模块化其实就是通过函数作用域的方式。

module.exports 导出就相当于是 iife 往 window 上挂载一样。

require 就是本地文件读取，然后执行模块函数，获取到导出对象。

node 的模块分为：

- 核心模块（如：fs，path），在 node 启用时就编译成二进制代码存到内存中，优先级仅次于缓存
- 文件模块（如：相对路径，绝对路径引用的）
- 自定义模块（如：require('abc')）

### module 属性

- id: 模块标识符，通常是绝对路径
- filename：文件模块绝对路径
- loaded：模块是否完成加载，布尔值
- parent：返回调用当前模块的模块，对象
- children：存放当前模块调用的其他模块，数组
- exports：导出的内容
- path：目录
- paths：不同目录下的 node_modules 路径，是自定义模块（也就是第三方包）查找的路径顺序

#### module.exports 与 exports 区别

每个模块文件都是函数，exports 是这个函数上的一个形参，而实参就是 module.exports。指向同一个地址，但是当给形参 exports 重新赋值，是不会改变实参 module.exports 的。

### require 属性

- resolve：模块文件绝对路径
- extensions：可以依据不同后缀名执行解析操作
- main：主模块对象，也就是入口，可以用来判断是不是入口文件。 require.main === module

## node 事件循环

![image](/node/node-event-loop.png)

[link](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)

node 有如下几个消息队列，按权重排列：

1. timers: setTimeout setInterval 回调
2. pending callbacks: 执行操作系统的回调，例如 tcp udp
3. idle, prepare: 只在系统内部使用
4. poll: I/O 相关，文件读写回调
5. check: setImmediate 回调
6. close callbacks: close 回调。e.g. socket.on('close', ...)

node 端的事件循环：先执行同步代码，然后清空微任务队列，然后按照消息队列权重依次查看执行。

process.nextTick() 不属于事件循环中的一环，nextTickQueue 将在当前操作完成后处理，而不管事件循环的当前阶段如何。

**Tips:**

> 旧版本 node，在消息队列的队列清空完，切换队列时才会去清空微任务队列。
> 而新版本 node，则是和浏览器相同，执行完队列中的任务就会去清空微任务队列。

```js
setTimeout(() => {
  console.log('s1')
  Promise.resolve().then(() => {
    console.log('p1')
  })
  process.nextTick(() => {
    console.log('t1')
  })
})

Promise.resolve().then(() => {
  console.log('p2')
})

console.log('start')

setTimeout(() => {
  console.log('s2')
  Promise.resolve().then(() => {
    console.log('p3')
  })
  process.nextTick(() => {
    console.log('t2')
  })
})

console.log('end')

// 旧版本
// start, end， p2, s1, s2 , t1, t2, p1, p3
// 新版本
// start, end， p2, s1, t1, p1, s2, t2, p3
```

## 中间件

中间件是一种 AOP(面向切面编程) 的实现方式。

这里的中间件案例都是在 express 中实现。

### 什么是中间件？

中间件的本质就是一个普通函数。

### 为什么需要有中间件，或者说中间件存在的含义是什么？

中间件可以将一些公共逻辑从路由中剥离，抽取成一个独立的公共函数来进行使用，在同一个请求周期中，可以用中间件在参数（req, res）上挂载需要的数据。

### 中间件分类

常用的中间件主要有以下几类：

- 应用程序级别（公共级别）
- 路由级别
- 错误处理
- 内置
- 第三方

### 中间件使用方法

#### 应用程序级别中间件（公共级别）

```js
app.use((req, res, next) => {
  console.log('这里是一个中间件')
  next()
})
```

中间件调用完后，一定要去调用 <code>next()</code>，<code>next()</code> 的作用就是跳出当前的中间件函数，执行下一个中间件函数。

路由函数也有 <code>next()</code>，从这个角度去看，路由函数其实也是中间件，只不过是一种**需要特殊匹配的中间件**。

```js
app.get('/', (req, res, next) => {
  console.log('这里是一个路由')
})
```

公共中间件的写入顺序也很重要，需要放在路由之前，如果放在路由之间，则在中间件之前的路由函数无法执行到中间件函数。

```js
// 中间件放在最前面
app.use((req, res, next) => {
  console.log('这里是一个中间件')
  req.abc = 'abc'
  next()
})

app.get('/a', (req, res, next) => {
  console.log(`这里可以取到${req.abc}`)
  console.log('这里是一个路由')
})

app.get('/b', (req, res, next) => {
  console.log(`这里可以取到${req.abc}`)
  console.log('这里是一个路由')
})
```

```js
// 路由a 无法执行中间件
app.get('/a', (req, res, next) => {
  console.log('这里是一个路由')
  next()
})

// 中间件放在最前面
app.use((req, res, next) => {
  console.log('这里是一个中间件')
  next()
})

app.get('/b', (req, res, next) => {
  console.log('这里是一个路由')
})
```

对同一个路由，可以设置多个中间件函数

```js
app.use(
  '/b',
  (req, res, next) => {
    console.log('这里是一个中间件')
    next()
  },
  (req, res, next) => {
    console.log('这里是另一个中间件')
    next()
  }
)

// 也可以这样
app.use(
  '/b',
  (req, res, next) => {
    console.log('这里是一个中间件')
    next()
  },
  (req, res, next) => {
    console.log('这里是另一个中间件')
    res.send(123)
    // 这里一定要 next() 才会执行下面的路由
    next()
  }
)

app.use('/b', (req, res, next) => {
  console.log('这里是一个中间件')
  next()
  // 但是这两句不会再返回给前端，会报错。因为同一个路由只能有一次响应
  // res.send('abc')
  // res.end('def')
})
```

单个路由有多个 <code>callback</code> 的时候，如果想要跳过，可以给 <code>next</code> 传递 'route'

```js
// 也可以这样
app.use(
  '/b',
  (req, res, next) => {
    console.log('这里是一个中间件1')
    // 会跳过2，直接执行3
    next('route')
  },
  (req, res, next) => {
    console.log('这里是另一个中间件2')
    // 这里一定要 next() 才会执行下面的路由
    next()
  }
)

app.use('/b', (req, res, next) => {
  console.log('这里是一个中间件3')
  next()
})
```

多个中间件可以用数组来组合

```js
const arr = [
  (req, res, next) => {
    console.log('这里是一个中间件1')
    next()
  },
  (req, res, next) => {
    console.log('这里是另一个中间件2')
    next()
  }
]
app.use('/b', arr, (req, res, next) => {
  console.log('这里是另一个中间件2')
  next()
})
```

#### 路由级别中间件

将路由拆分到不同的模块中，便于管理

```js
// router.js
const router = express.Router()

router.get('/a', arr, (req, res, next) => {})

router.get('/b', arr, (req, res, next) => {
  next()
})

export default router

// index.js

app.use(router)
// 可以增加前缀
// app.use('/common', router)
```

#### 错误处理中间件

错误处理中间件需要写在所有路由之后（一般写在 404 拦截路由之后），通过 next(err) 来进行跳入错误处理中间件。

在 `express` 中，如果给 `next` 传入非 `'route'` 参数，都视为是跳转错误处理中间件。

```js
app.get('/', (req, res, next) => {
  try {
    // ...
  } catch (e) {
    next(e)
  }
})

app.use((req, res, next) => {
  res.status(404).send('404 not found.')
})

// 错误处理中间件必须写 4 个形参，这样 express 才会认为是 错误处理中间件，猜测可能内部通过形参个数（fn.length）来判断。
app.use((err, req, res, next) => {
  // 会进入这里
})
```
