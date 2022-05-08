class Scheduler {
  constructor(limit) {
    this.limit = limit
    this.task = []
    this.excuteList = []
  }
  add(time, order, value) {
    
  }
  timeout(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve()
      }, time)
    })
  }
}
