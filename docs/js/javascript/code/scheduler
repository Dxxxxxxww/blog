// 实现一个Scheduler类，使下面的代码能正确输出。
// Usage
// const timeout = (time, value) =>
//   new Promise(resolve => {
//     setTimeout(() => resolve(value), time)
//   })
// const scheduler = new Scheduler(2)
// const addTask = (time, order, value) => {
//   return scheduler
//     .add(() => timeout(time, value))
//     .then(value => {
//       console.log(order)
//       return value
//     })
// }

// addTask(1000, '1', 'value111111').then(value => console.log(value))
// addTask(500, '2')
// addTask(300, '3', '311111').then(value => console.log(value))
// addTask(400, '4')
// output: 2 3 1 4

class Scheduler {
  constructor(limit) {
    this.limit = limit
    // task queue
    this.queue = []
    this.count = 0
  }
  async add(fn) {
    if (this.count >= this.limit) {
      await new Promise(resolve => {
        this.queue.push(resolve)
      })
    }
    this.count++
    const res = await fn()
    this.count--
    if (!!this.queue.length) {
      this.queue.shift()()
    }
    return res
  }

  add2(fn) {
    // 返回值
    return new Promise(resolve => {
      // 阻塞
      new Promise(resolveFunc => {
        if (this.count >= this.limit) {
          this.queue.push(resolveFunc)
        } else {
          this.count++
          resolveFunc()
        }
      }).then(() => {
        fn().then(res => {
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

function timeout(time, value) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(value)
    }, time)
  })
}

const scheduler = new Scheduler(2)

function addTask(time, order, value) {
  return scheduler
    .add2(() => timeout(time, value))
    .then(res => {
      console.log(order)
      return res
    })
}

addTask(1000, '1', 'value111111').then(value => console.log(value))
addTask(500, '2')
addTask(300, '3', '311111').then(value => console.log(value))
addTask(400, '4')
// // output: 2 3 1 4
