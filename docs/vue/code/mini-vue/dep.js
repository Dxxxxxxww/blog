class Dep {
  static target = null
  constructor() {
    this.subs = []
  }
  addSub(sub) {
    if (sub && sub.update) {
      this.subs.push(sub)
    }
  }
  notify(newVal) {
    this.subs.forEach((sub) => {
      sub.update(newVal)
    })
  }
}
