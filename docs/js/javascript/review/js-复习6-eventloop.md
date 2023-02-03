# EventLoop

事件循环是一种在 JS 单线程运行背景下的多任务处理方案。事件循环系统由一个执行器+多个消息队列组成。消息由 v8 引擎动态调度。

## 分类

常见的微任务有：

1. promise
2. mutationObserver
3. queueMicrotask
4. Process.nextTick（node 独有，并且具有高优先级）

常见的宏任务有：

1. script 代码
2. dom 渲染类事件
3. setTimeout 等延时线程回调函数
4. I/O
