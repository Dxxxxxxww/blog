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

node 的模块分为核心模块（如：fs，path），文件模块（如：相对路径，绝对路径引用的），自定义模块（如：require('abc')）

### module 属性

- id: 模块标识符，通常是绝对路径
- filename：文件模块绝对路径
- loaded：模块是否完成加载，布尔值
- parent：返回调用当前模块的模块，对象
- children：存放当前模块调用的其他模块，数组
- exports：导出的内容
- path：目录
- paths：不同目录下的 node_modules 路径，是自定义模块查找的路径顺序

#### module.exports 与 exports 区别

每个模块文件都是函数，exports 是这个函数上的一个形参，而实参就是 module.exports。指向同一个地址，但是当给形参 exports 重新赋值，是不会改变实参 module.exports 的。

### require 属性

- resolve：模块文件绝对路径
- extensions：可以依据不同后缀名执行解析操作
- main：主模块对象，也就是入口，可以用来判断是不是入口文件。 require.main === module
