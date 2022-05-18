class Scheduler {
  constructor(limit) {
    this.limit = limit
    this.count = 0
    this.queue = []
  }
  async add(callback) {
    if (this.count >= this.limit) {
      await new Promise((resolve) => this.queue.push(resolve))
    }
    this.count++
    const res = await callback()
    this.count--
    if (!!this.queue.length) {
      this.queue.shift()()
    }
    return res
  }
}

// Usage
const timeout = (time, value) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(value), time)
  })
const scheduler = new Scheduler(2)
const addTask = (time, order, value) => {
  return scheduler
    .add(() => timeout(time, value))
    .then((value) => {
      console.log(order)
      return value
    })
}

addTask(1000, '1', 'value111111').then((value) => console.log(value))
addTask(5000, '2')
addTask(3000, '3', '311111').then((value) => console.log(value))
addTask(4000, '4')
// output: 2 3 1 4
