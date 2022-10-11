// 实现变量 u 以满足以下条件：
// 1.  支持链式调用；
// 2. 执行 setTimeout 后，代码将会阻塞停滞，在指定时间以后继续执行。
// 这也就是 lazyman 题目
// async await 版本
class Queue {
  constructor() {
    this.queue = []
    setTimeout(async () => {
      while (this.queue.length) {
        const task = this.queue.shift()
        task && (await task())
      }
    }, 0)
  }
  setTimeout(time) {
    this.queue.push(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, time)
        })
    )
    return this
  }
  console(str) {
    this.queue.push(() => console.log(str))
    return this
  }
}

const u = new Queue()

u.console('breakfast') // 在控制台输出 'breakfast'
  .setTimeout(3000) // 延迟 3s
  .console('lunch') // 在控制台输出 'lunch'
  .setTimeout(3000) // 延迟 3s
  .console('dinner') // 在控制台输出 'dinner'

// promise 版本
class Queue {
  constructor() {
    this.queue = []
    setTimeout(async () => {
      // reduce 能做，其他循环肯定也能做，只要搞一个 let p = Promise.resolve()
      // 每次循环里执行 item并把结果(新的 promise)赋值给 p 就行了
      this.queue.reduce((p, item) => {
        return p.then(() => item())
      }, Promise.resolve())
    }, 0)
  }
  setTimeout(time) {
    this.queue.push(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, time)
        })
    )
    return this
  }
  console(str) {
    this.queue.push(() => {
      console.log(str)
      return Promise.resolve()
    })
    return this
  }
}

// function pq(list) {
//   list.reduce((p, item) => {
//     return p.then(() => item())
//   }, Promise.resolve())
// }

// pq([
//   () => {
//     console.log(1)
//     return Promise.resolve()
//   },
//   () => {
//     console.log(2)
//     return new Promise((resolve) => {
//       setTimeout(resolve, 3000)
//     })
//   },
//   () => {
//     console.log(3)
//     return Promise.resolve()
//   }
// ])
