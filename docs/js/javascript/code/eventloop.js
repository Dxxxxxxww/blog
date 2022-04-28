// 问题，public/js/code-challenge1.png
// 这种类型的题目，主要是要弄清楚两点，
// 1. 函数调用只是把任务添加到队列，真正执行函数是在下一个循环自动执行；
// 2. 睡眠等待的实现。

// 我的写法，算是结合了鸡哥和茂神的
// 我和茂神写法的思路都是通过微任务来链式执行，在下一个 task 之前编队，下一个 task 自动执行
// 鸡哥是使用执行栈 + task
const { log } = console
// day 11 promise 1
class _LazyMan {
  tasks = []
  constructor(name) {
    this.tasks.push(() => log(`Hi, this is ${name}`))
    setTimeout(async () => {
      while (!!this.tasks.length) {
        await this.tasks.shift()()
      }
    }, 0)
  }
  sleep(time) {
    this._sleepWrapper(time)
    return this
  }
  sleepFirst(time) {
    this._sleepWrapper(time, true)
    return this
  }
  eat(food) {
    this.tasks.push(() => log(`eat ${food}`))
    return this
  }

  _sleepWrapper(time, flag) {
    const fn = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          log(`wake up after ${time}s`)
          resolve()
        }, time * 1e3)
      })
    if (flag) {
      this.tasks.unshift(fn)
    } else {
      this.tasks.push(fn)
    }
    // 不能这么写，这样写就是同步代码直接执行了，需要放到函数里的
    // const p = new Promise((resolve) => {
    //   setTimeout(() => {
    //     log(`wake up after ${time}s`)
    //     resolve()
    //   }, time * 1e3)
    // })
    // if (flag) {
    //   this.tasks.unshift(() => p)
    // } else {
    //   this.tasks.push(() => p)
    // }
  }
}

function LazyMan(name) {
  return new _LazyMan(name)
}
LazyMan('hank').sleep(1).eat('cola').sleepFirst(3)

// 茂神写法
// function LazyMan(name) {
//   const { log } = console
//   const sleep = (s) =>
//     new Promise((res) =>
//       setTimeout(() => log(`Wake up after ${s}`) || res(), s * 1000)
//     )
//   // 定义队列并切设置第一个任务
//   const queue = [() => log(`Hi! This is ${name}!`)]

//   // 这个里用了 push(x) && ctx
//   // push 的返回值是数组 push 后的长度 所以不会出现 0 , 可以放心在箭头函数里使用
//   const ctx = {
//     eat: (food) => queue.push(() => log(`Eat ${food}~`)) && ctx,
//     sleep: (s) => queue.push(() => sleep(s)) && ctx,
//     sleepFirst: (s) => queue.unshift(() => sleep(s)) && ctx
//   }

//   // 延迟在下一个周期执行, 为了收集执行的任务
//   queueMicrotask(async () => {
//     while (queue.length) {
//       await queue.shift()()
//     }
//   })
//   return ctx
// }

// 鸡哥写法
// class _LazyMan {
//   constructor(name) {
//     this.tasks = []
//     const task = () => {
//       console.log(`Hi! This is ${name}!`)
//       this.next()
//     }
//     this.tasks.push(task)
//     setTimeout(() => {
//       // 把 this.next() 放到调用栈清空之后执行
//       this.next()
//     }, 0)
//   }
//   // 链式调用
//   next() {
//     const task = this.tasks.shift() // 执行第一个任务
//     task && task()
//   }

//   sleep(time) {
//     this._sleepwrapper(time, false)
//     return this
//   }

//   sleepFirst(time) {
//     this._sleepwrapper(time, true)
//     return this
//   }

//   _sleepwrapper(time, flag) {
//     const task = () => {
//       setTimeout(() => {
//         console.log(`Wake up after ${time}`)
//         this.next()
//       }, time * 1000)
//     }
//     if (flag) {
//       this.tasks.unshift(task) // 放到任务队列顶部
//     } else {
//       this.tasks.push(task)
//     }
//   }
//   eat(name) {
//     const task = () => {
//       console.log(`Eat ${name}`)
//       this.next()
//     }
//     this.tasks.push(task)
//     return this
//   }
// }

// function LazyMan(name) {
//   return new _LazyMan(name)
// }

// LazyMan('hank').sleep(3).eat('wahaha').sleepFirst(1)
