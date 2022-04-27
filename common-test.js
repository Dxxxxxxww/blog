const { log } = console
class _LazyMan {
  tasks = []
  constructor(name) {
    this.tasks.push(() => log(`Hi, this is ${name}`))
    setTimeout(async () => {
      while (!!this.tasks.length) {
        debugger
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
  }
}

function LazyMan(name) {
  return new _LazyMan(name)
}
LazyMan('hank').sleep(1).eat('cola').sleepFirst(5)
