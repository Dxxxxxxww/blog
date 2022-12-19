class Watcher {
  constructor(vm, key, cb) {
    this.cb = cb
    Dep.target = this
    this.oldValue = vm[key]
    Dep.target = null
  }
  update(newVal) {
    if (newVal === this.oldValue) {
      return
    }
    this.cb(newVal)
  }
}
