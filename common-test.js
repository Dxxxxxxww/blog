// arrange('William').wait(5).do('commit').wait(5).do('push').execute()

class Arrange {
  constructor(str) {
    this.queue = []
    this.do(str)
  }
  do(str) {
    this.queue.push(() => {
      console.log(str)
    })
    return this
  }
  wait(time) {
    this.queue.push(
      () =>
        new Promise((resolve) => {
          setTimeout(resolve, time * 1000)
        })
    )
    return this
  }
  async execute() {
    while (this.queue.length) {
      const fn = this.queue.shift()
      fn && (await fn())
    }
  }
}

function arrange(str) {
  return new Arrange(str)
}

arrange('William').wait(5).do('commit').wait(5).do('push').execute()
