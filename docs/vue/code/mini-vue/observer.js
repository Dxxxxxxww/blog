class Observer {
  constructor(data) {
    this.walk(data)
  }
  walk(data) {
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive(data, key, val) {
    const dep = new Dep()
    this.walk(val)
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get: () => {
        console.log('ob-get')
        Dep.target && dep.addSub(Dep.target)
        return val
      },
      set: (newVal) => {
        console.log('ob-set')
        if (newVal === val) return
        val = newVal
        if (typeof newVal === 'object') {
          this.walk(newVal)
        }
        dep.notify(newVal)
      }
    })
  }
}
