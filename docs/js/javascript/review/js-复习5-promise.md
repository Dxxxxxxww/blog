# promise

promise 就直接手写好了

```js
import instance from './docs/source-code/vue-2.6.14/src/core/instance'
import resolve from 'resolve'

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  successHandlerList = []
  failHandlerList = []

  constructor(callback) {
    try {
      callback(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }

  resolve = (val) => {
    if (this.status !== PENDING) return
    this.value = val
    this.status = FULFILLED
    while (this.successHandlerList.length) this.successHandlerList.shift()()
  }

  reject = (reason) => {
    if (this.status !== PENDING) return
    this.reason = reason
    this.status = REJECTED
    while (this.failHandlerList.length) this.failHandlerList.shift()()
  }

  then(success, fail) {
    success = isFunc(success) ? success : (val) => val
    fail = isFunc(fail)
      ? fail
      : (reason) => {
          throw reason
        }
    const subPromise = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const result = success(this.value)
            resolvePromise(subPromise, result, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const reason = fail(this.reason)
            resolvePromise(subPromise, reason, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        success &&
          this.successHandlerList.push(() => {
            setTimeout(() => {
              try {
                const result = success(this.value)
                resolvePromise(subPromise, result, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }, 0)
          })
        fail &&
          this.failHandlerList.push(() => {
            setTimeout(() => {
              try {
                const reason = fail(this.reason)
                resolvePromise(subPromise, reason, resolve, reject)
              } catch (e) {
                reject(e)
              }
            }, 0)
          })
      }
    })
    return subPromise
  }

  catch(fn) {
    this.then(null, fn)
  }

  finally(callback) {
    return this.then(
      (value) => MyPromise.resolve(callback()).then(() => value),
      (error) =>
        MyPromise.resolve(callback()).then(() => {
          throw error
        })
    )
  }

  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise((resolve) => resolve(value))
  }
  // 即便是一个 promise 对象，也会再包一层
  static reject(reason) {
    return new Promise((_, reject) => reject(reason))
  }
  // 只有所有结果都返回了才会返回，有一个返回失败就为失败
  static all(list) {
    return new MyPromise((resolve, reject) => {
      const result = []
      let item,
        index = 0
      const addItem = (key, val) => {
        result[key] = val
        index++
        if (index >= list.length) resolve(result)
      }
      for (let i = 0; i < list.length; i++) {
        item = list[i]
        if (item instanceof MyPromise) {
          item.then((val) => {
            addItem(i, val)
          }, reject)
        } else {
          addItem(i, item)
        }
      }
    })
  }

  static race(list) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < list.length; i++) {
        MyPromise.resolve(list[i]).then(resolve, reject)
      }
    })
  }

  static allSettled(list) {
    return new MyPromise((resolve, reject) => {
      const result = []
      let index = 0
      const addItem = (key, val) => {
        result[key] = val
        index++
        if (index >= list.length) resolve(result)
      }
      for (let i = 0; i < list.length; i++) {
        MyPromise.resolve(list[i]).then(
          (value) => addItem(i, { status: FULFILLED, value }),
          (reason) => addItem(i, { status: REJECTED, reason })
        )
      }
    })
  }

  static any(list) {
    return new MyPromise((resolve, reject) => {
      if (!list.length) {
        reject(new Error('All promises were rejected'))
        return
      }
      const result = []
      let index = 0
      const addItem = (key, val) => {
        result[key] = val
        index++
        if (index >= list.length) reject(result)
      }
      for (let i = 0; i < list.length; i++) {
        MyPromise.resolve(list[i]).then(resolve, (reason) => {
          addItem(i, reason)
        })
      }
    })
  }
}

const resolvePromise = (subPromise, res, resolve, reject) => {
  if (res instanceof MyPromise) {
    if (subPromise === res) {
      return reject(
        new TypeError('Chaining cycle detected for promise, 死循环')
      )
    }
    res.then(resolve, reject)
  } else {
    resolve(res)
  }
}

const isFunc = (fn) =>
  Object.prototype.toString.call(fn).slice(8, 16) === 'Function'

const p = new MyPromise((resolve, reject) => {
  resolve(123)
  // throw new Error('123')
})

// p.then(
//   (val) => {
//     console.log(val)
//     throw new Error('abc')
//     // return 456
//   },
//   (err) => {
//     console.log(err.message, typeof err, 1111111)
//   }
// ).then(
//   (val) => {
//     console.log(val)
//   },
//   (err) => {
//     console.log(err.message, 222222)
//   }
// )
p.then()
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
