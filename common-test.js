class _LazyMan {
  constructor(name) {
    this.queue = []
    this.queue.push(() => {
      console.log(name)
    })
    setTimeout(async () => {
      while (this.queue.length) {
        await this.queue.shift()()
      }
    })
  }
  sleep(time, isFront) {
    const fn = () =>
      new Promise((resolve) => {
        setTimeout(() => resolve(), time * 1e3)
      })

    if (isFront) {
      this.queue.unshift(fn)
    } else {
      this.queue.push(fn)
    }
    return this
  }
  eat(food) {
    this.queue.push(() => {
      console.log(food)
    })
    return this
  }
  sleepFirst(time) {
    this.sleep(time, true)
    return this
  }
}

function LazyMan(name) {
  return new _LazyMan(name)
}
LazyMan('hank').sleep(1).eat('cola').sleepFirst(3)
