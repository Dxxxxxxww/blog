class Scheduler {
  constructor(limit) {
    this.limit = limit
    // task queue
    this.queue = []
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
    if (!!this.queue.length) {
      this.queue.shift()()
    }
    return res
  }
  add3(callback) {
    return new Promise((resolve) => {
      new Promise((resolveFunc) => {
        this.currentJobs >= this.maxJobs
          ? this.queue.push(resolveFunc)
          : resolveFunc()
      }).then(() => {
        this.currentJobs++
        callback().then((result) => {
          this.currentJobs--
          if (this.queue.length) {
            const quueResolveFunc = this.queue.shift()
            quueResolveFunc()
          }
          resolve(result)
        })
      })
    })
  }

  add2(fn) {
    // 返回值
    return new Promise((resolve) => {
      // 阻塞
      new Promise((resolveFunc) => {
        if (this.count >= this.limit) {
          this.queue.push(resolveFunc)
        } else {
          this.count++
          resolveFunc()
        }
      }).then(() => {
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

// class Scheduler {
//   constructor(maxJobs) {
//     this.maxJobs = maxJobs
//     this.currentJobs = 0
//     this.queue = []
//   }

//   add(callback) {
//     // 外面这层用于返回值
//     return new Promise((resolve) => {
//       // 里面这层用于阻塞
//       new Promise((resolveFunc) => {
//         this.currentJobs >= this.maxJobs
//           ? this.queue.push(resolveFunc)
//           : resolveFunc()
//       }).then(() => {
//         this.currentJobs++
//         callback().then((result) => {
//           this.currentJobs--
//           if (this.queue.length) {
//             const quueResolveFunc = this.queue.shift()
//             quueResolveFunc()
//           }
//           resolve(result)
//         })
//       })
//     })
//   }

//   // add(callback) {
//   //   return new Promise((resolve) => {
//   //     if (this.currentJobs >= this.maxJobs) {
//   //       new Promise((resolve) => this.queue.push(resolve)).then(() => {
//   //         this.handleJob(resolve, callback)
//   //       })
//   //     } else {
//   //       this.handleJob(resolve, callback)
//   //     }
//   //   })
//   // }
// }

// const console = () => new Promise((resolve) => {
//     setTimeout(() => {
//         resolve(1)
//     }, 2000)
// })

// function aaa() {
//     console(1)
//     console.log(2)
// }

// async function bbb() {
//     await console(1)
//     console.log(2)
// }

function timeout(time, value) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value)
    }, time)
  })
}

const scheduler = new Scheduler(2)

function addTask(time, order, value) {
  return scheduler
    .add3(() => timeout(time, value))
    .then((res) => {
      console.log(order)
      return res
    })
}

addTask(1000, '1', 'value111111').then((value) => console.log(value))
addTask(500, '2')
addTask(300, '3', '311111').then((value) => console.log(value))
addTask(400, '4')
// // output: 2 3 1 4
