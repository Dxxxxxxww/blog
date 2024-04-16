class IndexDB {
  constructor(flag) {
    this.isIDB = flag
  }

  get() {
    if (this.isIDB) {
      return ''
    }

    // ...
    return 1
  }
  set() {
    if (this.isIDB) {
      return ''
    }

    // ...
    return 1
  }
  update() {
    if (this.isIDB) {
      return ''
    }

    // ...
    return 1
  }
}
