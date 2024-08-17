# requestIdleCallback

在每一帧空闲时期执行，如果当前帧没有空闲时期，则顺延到下一帧判断执行。

在不对页面做任何操作，并且页面没有重新渲染的情况下，空闲时期最长为 50ms。

rIC 的回调函数会接收一个参数，上面有属性可以判断是否已经超期，有方法可以查看当前空闲时期还剩余多少时间。

```js
requestIdleCallback(
  (deadline) => {
    console.log(deadline)
    // didTimeout: true 表示已经超期
    // timeRemaining() 查看空闲时期还剩多少时间
  },
  { timeout: 1000 }
)
```

## 最佳实践

rIC 一般都是在空闲时期做一些功能，如果我们执行的函数，执行时期太长就会影响页面。所以我们需要编写一个队列，在空闲时间从队列中取任务来执行。

```js
const globalQueue = []
let idleHandler = 0

function handleClick(cb) {
  globalQueue.push(cb)
}

function excute(deadline) {
  while (
    (deadline.didTimeout || deadline.timeRemaining() > 0) &&
    globalQueue.length
  ) {
    globalQueue.shift()()
  }

  if (globalQueue.length) {
    idleHandler = requestIdleCallback(excute, { timeout: 10000 })
  } else {
    idleHandler = 0
  }
}

function run() {
  requestIdleCallback(excute, { timeout: 10000 })
}
```

## 注意事项

不要在 rIC 中改变 dom，如果一定要改 dom ，配合 rAF 使用，在 rAF 中修改。
