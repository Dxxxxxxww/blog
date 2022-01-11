// 观察者模式

class Dep {
  constructor() {
    this.subs = []
  }
  addSubs(watcher) {
    if (!watcher || !watcher.update) {
      return
    }
    this.subs.push(watcher)
  }
  notify() {
    this.subs.forEach((watcher) => {
      watcher.update()
    })
  }
}

class Watcher {
  constructor(cb) {
    this.cb = cb
  }
  update() {
    this.cb()
  }
}

const dep = new Dep()
const watcher = new Watcher(() => {
  console.log('hello')
})
dep.addSubs(watcher)
dep.notify()

// 发布订阅模式

class EventCenter {
  constructor() {
    this.map = {}
  }
  $on(eventName, cb) {
    if (!this.map[eventName]) {
      // 同一个事件肯定会有多个订阅者，所以需要使用 list
      this.map[eventName] = [cb]
    } else {
      this.map[eventName].push(cb)
    }
  }
  $emit(eventName, args) {
    this.map[eventName].forEach((event) => {
      event(args)
    })
  }
}
const ec = new EventCenter()
ec.$on('click', () => {
  console.log('hello')
})
ec.$on('click', () => {
  console.log('world')
})

ec.$emit('click')
