const flowRight = (...args) => (value) =>
  args.reverse().reduce((initVal, current) => current(initVal), value)

class IO {
  static of(value) {
    return new IO(function() {
      return value
    })
  }

  constructor(fn) {
    this._value = fn
  }

  map(fn) {
    return new IO(flowRight(fn, this._value))
  }

  join() {
    return this._value()
  }

  // 组合函数
  flatMap(fn) {
    return this.map(fn).join()
  }
}

const fa = () => {
  return new IO(() => {
    console.log('fa')
    return 1
  })
}

const fb = (x) => {
  return new IO(() => {
    console.log('fb')
    return x
  })
}

const res = fa()
  .map((x) => x + 2) // 这里可以嵌套许多 map 函数，因为最终都会合并成一个函数
  .flatMap(fb)
  .join()

console.log(res)
