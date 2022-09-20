# 手写 Promise

对于 promise 来说，值只有两种情况，是 promise，不是 promise。如果是 promise 会使用 then 进行状态判断，如果不是 promise 就直接 resolve 了(即便是一个 Error 对象)。
**强调一遍，promise 只关心值是不是 promise**

```js
const p2 = new Promise((resolve, reject) => {
  // resolve("成功222");
  reject('失败2233')
})

p2.then('', (err) => {
  console.log(err)
  // 想要使用 catch 捕获住，这里必须使用 throw。可以理解为 try...catch
  // throw new Error('456') // 输出 errorLo:::: Error: 456
  return new Error('456') // 输出 hahaha Error: 456
}).then(
  (val) => {
    console.log('hahaha', val)
  },
  (err) => {
    console.log('errorLo::::', err)
  }
)
```

## 第一版 建立基本的 Promise

要手写模拟 promise，我们首先需要知道 Promise 的功能特点是什么，所以下面先写一个 Promise 使用 demo。

```js
const p = new Promise((resolve, reject) => {
  // 修改状态为成功，且不可更改
  resolve('成功')
  // 修改状态为失败，且不可更改
  reject('失败')
})

p.then(
  (value) => {
    console.log(value)
  },
  (err) => {
    console.log(err)
  }
)
```

通过观察上面代码，我们可以获得以下几点信息：

1. Promise 是一个类；
2. Promise 实例化时需要传入一个回调函数，回调函数接受两个可以更改状态的方法 resolve，reject，状态一经更改不可在变；
3. 这两个函数需要使用箭头函数来编写，否则 this 会指向 window；
4. Promise 具有 then 方法，可以接受两个函数参数，用来处理状态改变后的结果。

以下是代码实现：

```js
// 开始模拟
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 状态
  status = PENDING
  // then 接受的参数
  value = undefined
  // catch 接受的参数
  reason = undefined

  constructor(callback) {
    callback(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
  }

  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
  }

  then(success, fail) {
    if (this.status === FULFILLED) {
      return success(this.value)
    } else if (this.status === REJECTED) {
      return fail(this.reason)
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  // 修改状态为成功，且不可更改
  resolve('成功')
  // 修改状态为失败，且不可更改
  reject('失败')
})

p.then(
  (value) => {
    console.log(value)
  },
  (err) => {
    console.log(err)
  }
)
```

## 第二版 支持异步

```js
axios.get().then(() => {})
```

处理异步，就需要在 then 方法中添加状态没有发生变化时的处理。以下是代码实现：

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // promise 状态
  status = PENDING
  // resolve 参数
  value = undefined
  // reject 参数
  reason = undefined
  handleSuccess = undefined
  handleFail = undefined

  constructor(callback) {
    callback(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.status === PENDING) {
      this.status = FULFILLED
    }
    this.value = value
    this.handleSuccess(value)
  }

  reject = (reason) => {
    if (this.status === PENDING) {
      this.status = REJECTED
    }
    this.reason = reason
    this.handleFail(reason)
  }

  then(success, fail) {
    if (this.status === FULFILLED) {
      success(this.value)
    } else if (this.status === REJECTED) {
      fail(this.reason)
    } else {
      this.handleSuccess = success
      this.handleFail = fail
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('成功')
  }, 2000)
})

p.then(
  (value) => {
    console.log(value)
  },
  () => {}
)
```

## 第三版 同一个 Promise 对象可以添加多个 then 方法

```js
const p = Promise.resolve('成功')

p.then((val) => {
  console.log(val)
  return 1
})

p.then((val) => {
  console.log(val)
  return 2
})

p.then((val) => {
  console.log(val)
  return 3
})

// 成功
// 成功
// 成功
```

这时候，我们应该把多个 then 中处理成功/失败的回调存到一个数组中。以下是代码实现：

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  // 使用数组来存储多个 then 中的回调
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    callback(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.status !== PENDING) return
    this.value = value
    this.status = FULFILLED

    while (this.handleSuccess.length) {
      this.handleSuccess.shift()(value)
    }
  }

  reject = (reason) => {
    if (this.status !== PENDING) return
    this.reason = reason
    this.status = REJECTED

    while (this.handleFail.length) {
      this.handleFail.shift(reason)
    }
  }

  then(success, fail) {
    if (this.status === FULFILLED) {
      success(this.value)
    } else if (this.status === REJECTED) {
      fail(this.reason)
    } else {
      this.handleSuccess.push(success)
      this.handleFail.push(fail)
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  resolve('成功')
})

p.then((val) => {
  console.log(val)
  return 1
})

p.then((val) => {
  console.log(val)
  return 2
})

p.then((val) => {
  console.log(val)
  return 3
})

// 成功
// 成功
// 成功
```

## 第四版 支持链式调用，promise 返回基础值(未完善)

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  // 同一个 promise 对象可以调用多个 then 方法(不是链式调用)，所以使用函数保存
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    callback(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.status !== PENDING) return
    this.value = value
    this.status = FULFILLED
    while (this.handleSuccess.length) {
      // 当异步完成时执行处理函数，没有保存返回值到 this.value 中
      this.handleSuccess.shift()(value)
    }
  }
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.reason = reason
    this.status = REJECTED
    while (this.handleFail.length) {
      // 当异步完成时执行处理函数
      this.handleFail.shift()(reason)
    }
  }
  then(success, fail) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        resolve(success(this.value))
      } else if (this.status === REJECTED) {
        reject(fail(this.reason))
      } else {
        // 异步时先将处理函数保存下来
        // 这里保存了异步，然后在 resolve 里调用时没有使用 resolve 改变状态，保存 success 返回值，所以异步时无法多次调用 then 。解决方案看第八版
        success && this.handleSuccess.push(success)
        fail && this.handleFail.push(fail)
      }
    })
  }
}

const p = new MyPromise((resolve, reject) => {
  // 这一版在处理异步时有问题，第二个 then
  // 不会调用
  // setTimeout(() => resolve("成功"), 2000);
  resolve('成功')
})

p.then(function a(v) {
  console.log(v)
  return 100
}).then(function b(v) {
  console.log(v)
})

// 成功
// 100
```

## 第五版 链式调用支持返回 promise(未完善)

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  // 同一个 promise 对象可以调用多个 then 方法(不是链式调用)，所以使用函数保存
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    callback(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.status !== PENDING) return
    this.value = value
    this.status = FULFILLED
    while (this.handleSuccess.length) {
      // 当异步完成时执行处理函数，没有保存返回值到 this.value 中
      this.handleSuccess.shift()(value)
    }
  }
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.reason = reason
    this.status = REJECTED
    while (this.handleFail.length) {
      // 当异步完成时执行处理函数
      this.handleFail.shift()(reason)
    }
  }
  then(success, fail) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        const res = success(this.value)
        resolvePromise(res, resolve, reject)
      } else if (this.status === REJECTED) {
        reject(fail(this.reason))
      } else {
        // 异步时先将处理函数保存下来
        // 这里保存了异步，然后在 resolve 里调用时没有使用 resolve 改变状态，保存 success 返回值，所以异步时无法多次调用 then。解决方案看第八版
        success && this.handleSuccess.push(success)
        fail && this.handleFail.push(fail)
      }
    })
  }
}

const resolvePromise = (value, resolve, reject) => {
  if (value instanceof MyPromise) {
    value.then(resolve, reject)
  } else {
    resolve(value)
  }
}

const p = new MyPromise((resolve, reject) => {
  // 这一版在处理异步时有问题，第二个 then
  // 不会调用
  // setTimeout(() => resolve("成功"), 2000);
  resolve('成功')
})

const p2 = new MyPromise((resolve) => {
  resolve('other')
})

p.then(function a(v) {
  console.log(v)
  return p2
}).then(function b(v) {
  console.log(v)
})
```

## 第六版 支持抛出 promise 返回自身陷入循环报错

```js
const promise = new Promise((resolve, reject) => {
  resolve(100)
})

const p2 = promise.then(() => p2)

p2.catch((err) => console.log(err)) // TypeError: Chaining cycle detected for promise #<Promise>
```

由上述代码可知，当一个 promise.then 返回的 promise 与 promise.then 中的 success 方法返回值相同时，就会报错。以下是代码实现：

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    callback(this.resolve, this.reject)
  }
  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
    while (this.handleSuccess.length) this.handleSuccess.shift()(value)
  }
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.handleFail.length) this.handleFail.shift()(reason)
  }
  then(success, fail) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过 setTimeout 产生异步，使 resolvePromise 可以拿到 p2
        setTimeout(() => {
          const res = success(this.value)
          resolvePromise(promise2, res, resolve, reject)
        }, 0)
      } else if (this.status === REJECTED) {
        fail(this.reason)
      } else {
        this.handleSuccess.push(success)
        this.handleFail.push(fail)
      }
    })
    return promise2
  }
}

const resolvePromise = (promise2, res, resolve, reject) => {
  if (res instanceof MyPromise) {
    if (promise2 === res)
      return reject(
        new TypeError('Chaining cycle detected for promise #<Promise>, 死循环')
      )
    return res.then(resolve, reject)
  }
  resolve(res)
}

const p = new MyPromise((resolve, reject) => {
  // setTimeout(() => resolve("成功"), 2000);
  resolve('成功')
})

const p2 = p.then(() => p2)

p2.then(
  (v) => {
    console.log(v)
  },
  (err) => {
    console.log(err) // TypeError: Chaining cycle detected for promise #<Promise>, 死循环
  }
)
```

## 第七版 支持捕获 Promise 实例化时的参数函数报错，以及 then 成功回调的报错

```js
// Promise 实例化时的参数函数报错
const p = new Promise((resolve, reject) => {
  throw new Error('123')
})

p.catch((err) => {
  console.log(err) // Error: 123
})

// then 成功回调的报错
const p = new Promise((resolve, reject) => {
  resolve(123)
})

p.then(() => {
  throw new Error('abc')
}).catch((err) => {
  console.log(err) // Error: abc
})
```

以下是代码实现：

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    try {
      callback(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }
  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
    while (this.handleSuccess.length) this.handleSuccess.shift()(value)
  }
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.handleFail.length) this.handleFail.shift()(reason)
  }
  then(success, fail) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过 setTimeout 产生异步，使 resolvePromise 可以拿到 p2
        setTimeout(() => {
          try {
            const res = success(this.value)
            resolvePromise(promise2, res, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        fail(this.reason)
      } else {
        this.handleSuccess.push(success)
        this.handleFail.push(fail)
      }
    })
    return promise2
  }
}

const resolvePromise = (promise2, res, resolve, reject) => {
  if (res instanceof MyPromise) {
    if (promise2 === res)
      return reject(
        new TypeError('Chaining cycle detected for promise #<Promise>, 死循环')
      )
    return res.then(resolve, reject)
  }
  resolve(res)
}

const p = new MyPromise((resolve, reject) => {
  throw new Error('123')
})

p.then(
  (v) => {
    console.log(v)
  },
  (err) => {
    console.log(err) // Error: 123
  }
)
// ---
const p = new MyPromise((resolve, reject) => {
  resolve(123)
})

p.then(
  (v) => {
    console.log(v) // 123
    throw new Error('abc')
  },
  (err) => {
    console.log(err)
  }
).then(
  () => {},
  (err) => console.log(`wahaha-${err}`) // wahaha-Error: abc
)
```

## 第八版 链式调用支持其他状态，并解决第四版，第五版中的异步问题

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    try {
      callback(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }
  // 更改状态，保存值供下一次 then 方法使用
  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
    while (this.handleSuccess.length) this.handleSuccess.shift()()
  }
  // 更改状态，保存值供下一次 catch 方法使用
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.handleFail.length) this.handleFail.shift()()
  }
  // 查看 promise 状态
  then(success, fail) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过异步，拿到 promise2
        setTimeout(() => {
          try {
            const res = success(this.value)
            resolvePromise(promise2, res, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const err = fail(this.reason)
            resolvePromise(promise2, err, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else {
        this.handleSuccess.push(() => {
          setTimeout(() => {
            try {
              const res = success(this.value)
              resolvePromise(promise2, res, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.handleFail.push(() => {
          setTimeout(() => {
            try {
              const err = fail(this.reason)
              resolvePromise(promise2, err, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return promise2
  }
}

const resolvePromise = (otherPromise, res, resolve, reject) => {
  // 如果是 promise 需要查看其状态，再判断执行 resolve 还是 reject
  if (res instanceof MyPromise) {
    if (otherPromise === res) {
      return reject(
        new TypeError('死循环, Chaining cycle detected for promise')
      )
    }
    return res.then(resolve, reject)
  }
  resolve(res)
}

const p1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('aaa')
  }, 2000)
})

const p2 = p1.then(
  (val) => {
    console.log(val)
    return 10000
  },
  (err) => {
    console.log(err)
    throw new Error('娃哈哈')
  }
)

p2.then(
  (value) => {
    console.log(value)
  },
  (err) => console.log(err)
)
```

## 第九版 then 参数可以为空

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    try {
      callback(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }
  // 更改状态，保存值供下一次 then 方法使用
  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
    while (this.handleSuccess.length) this.handleSuccess.shift()()
  }
  // 更改状态，保存值供下一次 catch 方法使用
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.handleFail.length) this.handleFail.shift()()
  }
  // 查看 promise 状态
  then(success, fail) {
    success = isFunc(success) ? success : (value) => value
    fail = isFunc(fail)
      ? fail
      : (reason) => {
          throw reason
        }
    // then 返回的 promise
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过异步，拿到 promise2
        setTimeout(() => {
          try {
            // then 中的回调的返回值
            const res = success(this.value)
            resolvePromise(promise2, res, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            // then 中的回调的返回值
            const err = fail(this.reason)
            resolvePromise(promise2, err, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else {
        this.handleSuccess.push(() => {
          setTimeout(() => {
            try {
              const res = success(this.value)
              resolvePromise(promise2, res, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.handleFail.push(() => {
          setTimeout(() => {
            try {
              const err = fail(this.reason)
              resolvePromise(promise2, err, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return promise2
  }
}

const resolvePromise = (otherPromise, res, resolve, reject) => {
  // 如果是 promise 需要查看其状态，再判断执行 resolve 还是 reject
  if (res instanceof MyPromise) {
    if (otherPromise === res) {
      return reject(
        new TypeError('死循环, Chaining cycle detected for promise')
      )
    }
    return res.then(resolve, reject)
  }
  resolve(res)
}

const isFunc = (func) =>
  Object.prototype.toString.call(func).slice(8, 16) === 'Function'

const p1 = new MyPromise((resolve, reject) => {
  resolve('aaa')
})

const p2 = p1
  .then()
  .then()
  .then(
    (val) => {
      console.log('val-', val)
    },
    (err) => {
      console.log('err-', err)
    }
  )
```

## 第十版 实现静态 all 方法，实现 静态 resolve 方法，实现 catch 方法，实现 finally 方法

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  handleSuccess = []
  handleFail = []

  constructor(callback) {
    try {
      callback(this.resolve, this.reject)
    } catch (error) {
      this.reject(error)
    }
  }
  // 不能用 async await 来模拟。如果使用 async await 并发怎么办
  static all(arr) {
    const res = []
    let index = 0
    return new MyPromise((resolve, reject) => {
      const len = arr.length
      const addItem = (k, v) => {
        res[k] = v
        index++
        if (index === len) {
          resolve(res)
        }
      }
      for (let i = 0; i < len; i++) {
        const current = arr[i]
        if (current instanceof MyPromise) {
          // promise
          current.then((value) => addItem(i, value), reject)
        } else {
          // 其他类型
          addItem(i, current)
        }
      }
    })
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise((resolve) => resolve(value))
  }

  // 更改状态，保存值供下一次 then 方法使用
  resolve = (value) => {
    if (this.status !== PENDING) return
    this.status = FULFILLED
    this.value = value
    while (this.handleSuccess.length) this.handleSuccess.shift()()
  }
  // 更改状态，保存值供下一次 catch 方法使用
  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.handleFail.length) this.handleFail.shift()()
  }
  // 查看 promise 状态
  then(success, fail) {
    success = isFunc(success) ? success : (value) => value
    fail = isFunc(fail)
      ? fail
      : (reason) => {
          throw reason
        }
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过异步，拿到 promise2
        setTimeout(() => {
          try {
            const res = success(this.value)
            resolvePromise(promise2, res, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            // catch 返回的非 promise 值也会 resolve 处理
            const err = fail(this.reason)
            resolvePromise(promise2, err, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else {
        this.handleSuccess.push(() => {
          setTimeout(() => {
            try {
              const res = success(this.value)
              resolvePromise(promise2, res, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.handleFail.push(() => {
          setTimeout(() => {
            try {
              const err = fail(this.reason)
              resolvePromise(promise2, err, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return promise2
  }

  catch(fail) {
    return this.then(undefined, fail)
  }

  finally(callback) {
    // 首先要查看上一个 promise 的状态，查看状态需要用到 then
    // finally 会返回一个 promise，then 也会返回一个 promise
    // finally 会将前一个 promise 的返回值传递下去，自身回调的返回值则不会
    // finally 回调不接受任何参数
    return this.then(
      (val) => {
        // 如果 finally 的回调返回一个 异步的 promise ，后面的 then 也同样需要等待这个 promise 改变状态后才能调用
        return MyPromise.resolve(callback()).then(
          () => val,
          (err) => {
            throw err
          }
        )
      },
      (err) => {
        return MyPromise.resolve(callback()).then(
          () => err,
          (error) => {
            throw error
          }
        )
      }
    )
  }
}

const resolvePromise = (otherPromise, res, resolve, reject) => {
  // 如果是 promise 需要查看其状态，再判断执行 resolve 还是 reject
  if (res instanceof MyPromise) {
    if (otherPromise === res) {
      return reject(
        new TypeError('死循环, Chaining cycle detected for promise')
      )
    }
    return res.then(resolve, reject)
  }
  resolve(res)
}

const isFunc = (func) =>
  Object.prototype.toString.call(func).slice(8, 16) === 'Function'

// 测试 all
const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve('成功'), 2000)
  // setTimeout(() => reject("失败"), 2000);
})
const p2 = new MyPromise((resolve, reject) => {
  resolve('成功222')
  // reject("失败222");
})

MyPromise.all([p, 1, 2, p2, 3, 4]).then(
  (val) => console.log(val),
  (err) => console.log(err)
)
// [ '成功', 1, 2, '成功222', 3, 4 ]

// 测试 finally
const p = new MyPromise((resolve, reject) => {
  // setTimeout(() => resolve("成功"), 2000);
  setTimeout(() => reject('失败'), 2000)
})
const p2 = new MyPromise((resolve, reject) => {
  // resolve("成功222");
  reject('失败222')
})

p2.finally(() => {
  console.log('finally')
  return p
}).then(
  (val) => {
    console.log(val)
  },
  (err) => {
    console.log(err)
  }
)

// 前一个成功(p2)，finally 返回的 promise(p) 成功：取前的成功状态
// 前一个成功(p2)，finally 返回的 promise(p) 失败：取后的失败状态
// 前一个失败(p2)，finally 返回的 promise(p) 成功：取前的失败状态
// 前一个失败(p2)，finally 返回的 promise(p) 失败：取后的失败状态

// 测试 catch
const p2 = new MyPromise((resolve, reject) => {
  // resolve("成功222");
  reject('失败2233')
})

p2.catch((err) => {
  console.log(err)
})
// 失败2233
```

## mm 的 promise A+

```js
/**
 * Promise A+ 规范实现
 **/

// 定义三个常量表示 Promise 的状态
// 等待状态 可以变更为成功或失败
const PENDING = 'pending'
// 成功状态
const FULFILLED = 'fulfilled'
// 失败状态
const REJECTED = 'rejected'

/**
 * 工具方法
 **/
function isFunction(value) {
  return typeof value === 'function'
}
function isObject(value) {
  return typeof value === 'object' && value !== null
}
function isIterator(value) {
  return value && isFunction(value[Symbol.iterator])
}

// 定时器函数
// 为了确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行
function nextTick(fn) {
  setTimeout(fn, 0)
}

/**
 * 规范 2.3
 * 实现兼容多种 Promise 的 resolutionProcedure 函数
 */
function resolutionProcedure(promise2, x, resolve, reject) {
  // 2.3.1 promise2 返回结果 x 为自身，应直接执行 reject
  if (promise2 === x) {
    return reject(new TypeError('Error 循环引用'))
  }

  // 2.3.2 如果 x 是一个 Promise 实例
  if (x instanceof Promise) {
    x.then(
      // 继续调用 resolutionProcedure 解析
      // 防止 value 的返回值还是一个 Promise
      (value) => resolutionProcedure(promise2, value, resolve, reject),
      reject
    )
    return
  }

  // 设置一个标志位，防止重复调用
  let called = false
  // 2.3.3 判断 x 是不是对象或函数
  if (isObject(x) || isFunction(x)) {
    // 防止取值时出错
    try {
      // 2.3.3.1 让 x 作为 x.then
      let then = x.then

      if (isFunction(then)) {
        // 2.3.3.3 如果 then 是一个方法，把 x 当作 this 来调用它
        // 其中第一个参数为 resolvePromise，第二个参数为 rejectPromise
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            // 防止 y 的返回值还是一个 Promise
            resolutionProcedure(promise2, y, resolve, reject)
          },
          (r) => {
            // 失败结果会向下传递
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        // 2.3.3.4 如果 then 不是一个函数，用 x 完成 promise
        resolve(x)
      }
    } catch (error) {
      // 2.3.3.2 如果取 x.then 的值时抛出错误 e 则以 e 为据因执行 reject
      if (called) return
      called = true
      reject(error)
    }
  } else {
    // 2.3.4 x 是一个普通值就直接调用 resolve(x)
    resolve(x)
  }
}

class Promise {
  /**
   * 在 new Promise 的时候会传入一个执行器 (executor) 同时这个执行器是立即执行的
   * state              Promise 的初始状态为等待状态
   * value              成功的值
   * reason             失败的原因
   * resolvedCallbacks  resolve 回调队列
   * rejectedCallbacks  reject 回调队列
   **/
  constructor(executor) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined

    this.resolvedCallbacks = []
    this.rejectedCallbacks = []

    /**
     * 在 resolve 函数和 reject 函数中
     * 只有等待状态 (pending) 下的 Promise 才能修改状态
     */
    // 成功函数
    const resolve = (value) => {
      // 如果 value 是个 Promise 则递归执行
      if (value instanceof Promise) {
        return value.then(resolve, reject)
      }

      nextTick(() => {
        if (this.state === PENDING) {
          this.state = FULFILLED
          this.value = value

          // 执行 resolve 回调队列
          this.resolvedCallbacks.forEach((fn) => fn())
        }
      })
    }

    // 失败函数
    const reject = (reason) => {
      nextTick(() => {
        if (this.state === PENDING) {
          this.state = REJECTED
          this.reason = reason

          // 执行 reject 回调队列
          this.rejectedCallbacks.forEach((fn) => fn())
        }
      })
    }

    /**
     * 执行器 (executor) 接收两个参数，分别是 resolve, reject
     * 为了防止执行器 (executor) 在执行时出错，需要进行错误捕获，并将错误传入 reject 函数
     */
    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  /**
   * Promise.prototype.then() 实现
   * then 方法接收两个参数 onFulfilled 和 onRejected
   * onFulfilled 和 onRejected 均为可选参数
   */
  then(onFulfilled, onRejected) {
    onFulfilled = isFunction(onFulfilled) ? onFulfilled : (v) => v
    onRejected = isFunction(onRejected)
      ? onRejected
      : (e) => {
          throw e
        }
    /**
     * 在链式调用时需要返回一个新的 promise
     * 在 then 函数中，无论是成功还是失败的回调，只要返回了结果就会传入下一个 then 的成功回调
     * 如果出现错误就会传入下一个 then 的失败回调
     * 即：下一个 then 的状态和上一个 then 执行时候的状态无关
     * 所以在 then 执行的时候 onFulfilled, onRejected 可能会出现错误，需要捕获错误，并执行失败回调（处理成失败状态）
     */
    const promise2 = new Promise((resolve, reject) => {
      if (this.state === FULFILLED) {
        nextTick(() => {
          // 成功状态调用 onFulfilled
          try {
            // 为了链式调用，需要获取 onFulfilled 函数执行的返回值，通过 resolve 返回
            const x = onFulfilled(this.value)
            // 通过 resolutionProcedure 函数对 x 的返回值做处理
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
      if (this.state === REJECTED) {
        // 失败状态调用 onRejected
        nextTick(() => {
          try {
            // 为了链式调用，需要获取 onRejected 函数执行的返回值，通过 resolve 返回
            const x = onRejected(this.reason)
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }

      // 当 Promise 状态为等待状态 (pending) 时，将 onFulfilled 和 onRejected 存入对应的回调队列
      if (this.state === PENDING) {
        // 存入 onFulfilled 函数
        this.resolvedCallbacks.push(() => {
          try {
            const x = onFulfilled(this.value)
            // 通过 resolutionProcedure 函数对 x 的返回值做处理
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
        // 存入 onRejected 函数
        this.rejectedCallbacks.push(() => {
          try {
            const x = onRejected(this.reason)
            resolutionProcedure(promise2, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        })
      }
    })

    return promise2
  }

  /**
   * Promise.prototype.catch() 实现
   * catch 用于指定发生错误时的回调函数，实际就是 .then(null, onRejected) 的别名
   * https://es6.ruanyifeng.com/#docs/promise#Promise-prototype-catch
   */
  catch(cb) {
    return this.then(null, cb)
  }

  /**
   * Promise.prototype.finally() 实现
   * finally 方法用于指定不管 Promise 对象最后状态如何，都会执行的操作
   * 在 finally 后还能继续 then ，并会将值原封不动的传递下去
   * finally 本质上是 then 方法的特例
   * 该方法由 ES2018 引入
   * https://es6.ruanyifeng.com/#docs/promise#Promise-prototype-finally
   */
  finally(cb) {
    return this.then(
      (value) => Promise.resolve(cb()).then(() => value),
      (error) =>
        Promise.resolve(cb()).then(() => {
          throw error
        })
    )
  }

  /**
   * Promise.resolve() 实现
   * 将现有对象转为 Promise 实例，该实例的状态为 resolved
   * https://es6.ruanyifeng.com/#docs/promise#Promise-resolve
   */
  static resolve(value) {
    // 如果参数是 Promise 实例，那么Promise.resolve将不做任何修改、原封不动地返回这个实例。
    if (value instanceof Promise) {
      return value
    }

    return new Promise((resolve, reject) => {
      // 如果参数是一个 thenable 对象
      // thenable 对象指的是具有 then 方法的对象
      if (isObject(value) && isFunction(value.then)) {
        value.then(resolve, reject)
      } else {
        // 如果参数是一个原始值，则返回一个新的 Promise 对象，状态为 resolved
        resolve(value)
      }
    })
  }

  /**
   * Promise.reject() 实现
   * 将现有对象转为 Promise 实例，该实例的状态为 rejected
   * https://es6.ruanyifeng.com/#docs/promise#Promise-reject
   */
  static reject(error) {
    return new Promise((resolve, reject) => {
      reject(error)
    })
  }

  /**
   * Promise.all() 实现
   * 用于将多个 Promise 实例，包装成一个新的 Promise 实例
   * 只有所有的 Promise 状态成功才会成功，如果其中一个 Promise 的状态失败就会失败
   * https://es6.ruanyifeng.com/#docs/promise#Promise-all
   */
  static all(promises) {
    return new Promise((resolve, reject) => {
      // 参数不为 Iterator 时直接 reject
      if (!isIterator(promises)) {
        reject(new TypeError('参数必须为 Iterator'))
        return
      }

      const result = []

      // length 为 0 时直接返回
      if (promises.length === 0) {
        resolve(result)
        return
      }

      // 记录当前已成功的 Promise 数量
      let num = 0

      // resolve 验证函数
      function check(i, data) {
        result[i] = data
        num++
        // 只有成功的 Promise 数量等于传入的数组长度时才调用 resolve
        if (num === promises.length) {
          resolve(result)
        }
      }

      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          (v) => {
            check(i, v)
          },
          (e) => {
            // 当其中一个 Promise 失败时直接调用 reject
            reject(e)
            return
          }
        )
      }
    })
  }

  /**
   * Promise.race() 实现
   * 用于将多个 Promise 实例，包装成一个新的 Promise 实例
   * 新的 Promise 实例状态会根据最先更改状态的 Promise 而更改状态
   * https://es6.ruanyifeng.com/#docs/promise#Promise-race
   */
  static race(promises) {
    return new Promise((resolve, reject) => {
      // 参数不为 Iterator 时直接 reject
      if (!isIterator(promises)) {
        reject(new TypeError('参数必须为 Iterator'))
        return
      }

      for (let i = 0; i < promises.length; i++) {
        // 只要有一个 Promise 状态发生改变，就调用其状态对应的回调方法
        Promise.resolve(promises[i]).then(resolve, reject)
      }
    })
  }

  /**
   * Promise.allSettled() 实现
   * 用于将多个 Promise 实例，包装成一个新的 Promise 实例
   * 新的 Promise 实例只有等到所有这些参数实例都返回结果，不管是 resolved 还是 rejected ，包装实例才会结束，一旦结束，状态总是 resolved
   * 该方法由 ES2020 引入
   * https://es6.ruanyifeng.com/#docs/promise#Promise-allSettled
   */
  static allSettled(promises) {
    return new Promise((resolve, reject) => {
      // 参数不为 Iterator 时直接 reject
      if (!isIterator(promises)) {
        reject(new TypeError('参数必须为 Iterator'))
        return
      }

      const result = []

      // length 为 0 时直接返回
      if (promises.length === 0) {
        resolve(result)
        return
      }

      // 记录当前已返回结果的 Promise 数量
      let num = 0

      // resolve 验证函数
      function check(i, data) {
        result[i] = data
        num++
        // 只有已返回结果的 Promise 数量等于传入的数组长度时才调用 resolve
        if (num === promises.length) {
          resolve(result)
        }
      }

      for (let i = 0; i < promises.length; i++) {
        Promise.resolve(promises[i]).then(
          (value) => {
            check(i, {
              status: FULFILLED,
              value
            })
          },
          (reason) => {
            check(i, {
              status: REJECTED,
              reason
            })
          }
        )
      }
    })
  }

  /**
   * Promise.any() 实现
   * 用于将多个 Promise 实例，包装成一个新的 Promise 实例
   * 只要参数实例有一个变成 resolved 状态，包装实例就会变成 resolved 状态；如果所有参数实例都变成 rejected 状态，包装实例就会变成 rejected 状态
   * https://es6.ruanyifeng.com/#docs/promise#Promise-any
   */
  static any(promises) {
    return new Promise((resolve, reject) => {
      const rejects = []

      // 如果 length 为 0 时直接 reject
      if (promises.length === 0) {
        /**
         * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/AggregateError
         * reject(new AggregateError(rejects, 'All promises were rejected'))
         */
        reject(new Error('All promises were rejected'))
        return
      }

      // 记录当前已失败的 Promise 数量
      let num = 0

      // reject 验证函数
      function check(i, data) {
        rejects[i] = data
        num++
        // 只有失败的 Promise 数量等于传入的数组长度时才调用 reject
        if (num === promises.length) {
          reject(rejects)
        }
      }

      for (let i = 0; i < promises.length; i++) {
        // 当其中一个 Promise 成功时直接调用 resolve
        Promise.resolve(promises[i]).then(resolve, (r) => {
          check(i, r)
        })
      }
    })
  }

  /**
   * Promise.promisify() 实现
   * 用于将回调函数转换为 promise 的辅助函数，适用于 error-first 回调模式(nodejs)
   * error-first 模式的回调函数无论成功或者失败都会执行
   * error-first 回调定义规则：
   *    1. 回调函数的第一个参数保留给一个错误 error 对象，如果有错误发生，错误将通过第一个参数 err 返回。
   *    2. 回调函数的第二个参数为成功响应的数据保留，如果没有错误发生，err将被设置为null, 成功的数据将从第二个参数返回。
   *
   */
  static promisify(func) {
    return function (...options) {
      return new Promise((resolve, reject) => {
        func(...options, (err, ...data) => {
          // 通过回调函数返回的参数来控制 promise 的状态
          if (err) {
            reject(err)
          }
          resolve(...data)
        })
      })
    }
  }
}

// promises-aplus-tests 测试方法
Promise.defer = Promise.deferred = function () {
  const dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = Promise
```
