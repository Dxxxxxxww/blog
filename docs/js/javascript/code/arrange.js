// 这种类型的题目，主要是要弄清楚两点，
// 1. 函数调用只是把任务添加到队列，真正执行函数是在下一个循环自动执行；
// 2. 睡眠等待的实现。

// 实现 arrange('William').wait(5).do('commit').wait(5).do('push').execute()
class Arrange {
  tasks = []
  constructor(name) {
    this.tasks.push(() => {
      console.log(`hi, this is ${name}`)
    })
  }
  wait(time) {
    this.tasks.push(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            console.log(`wake up after ${time}s`)
            resolve()
          }, time * 1e3)
        })
    )
    return this
  }
  do(action) {
    this.tasks.push(() => {
      console.log(`do ${action}`)
    })
    return this
  }
  async execute() {
    while (!!this.tasks.length) {
      const task = this.tasks.shift()
      task && (await task())
    }
  }
}

const arrange = (name) => new Arrange(name)

arrange('William').wait(3).do('commit').wait(3).do('push').execute()
