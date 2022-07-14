class Scheduler {
  constructor(limit) {
    this.queue = []
    // 并发限制
    this.limit = limit
    // 当前正在运行的任务个数
    this.count = 0
  }
  async add(fn) {
    if (this.count >= this.limit) {
      await new Promise((resolve) => {
        this.queue.push(resolve)
      })
    }

    this.count++
    const res = await fn()
    this.count--
    if (this.queue.length) {
      this.queue.shift()()
    }
    return res
  }

  add2(fn) {
    // 外层包裹一个 promise 用来返回 fn 执行结果，通过 resolve 来获取结果
    return new Promise((resolve) => {
      new Promise((resolveFunc) => {
        if (this.count >= this.limit) {
          this.queue.push(resolveFunc)
        } else {
          // 计数器在 fn 执行前增加
          this.count++
          // 修改 Promise 状态，让 fn 可以执行
          resolveFunc()
        }
      }).then(() => {
        // 这里也相当于是闭包缓存着 fn
        fn().then((res) => {
          this.count--
          resolve(res)
          if (this.queue.length) {
            this.queue.shift()()
          }
        })
      })
    })
  }
}

const scheduler = new Scheduler(2)

function timeout(time, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, time)
  })
}

function addTask(time, order, value) {
  return scheduler
    .add2(() => timeout(time, value))
    .then((res) => {
      console.log(order)
      return res
    })
}

addTask(1000, '1', 'value111111').then((value) => console.log(value))
addTask(500, '2')
addTask(300, '3', '311111').then((value) => console.log(value))
addTask(400, '4')
// output: 2 3 1 4
