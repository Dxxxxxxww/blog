// new Promise((resolve, reject) => {
//   resolve(value)
//   reject(error)
// }).then((res) => 1).then((res) => console.log())

import resolve from 'resolve'

/**
 * 第一版 建立基本的 Promise
 * 第二版 支持异步修改状态
 * 第三版 同一个 Promise 对象可以添加多个 then 方法
 * 第四版 支持链式调用，promise 返回基础值(未完善)
 * 第五版 链式调用支持返回 promise(未完善)
 * 第六版 支持抛出 promise 返回自身陷入循环报错
 * 第七版 支持捕获 Promise 实例化时的参数函数报错，以及 then 成功回调的报错
 * 第八版 链式调用支持其他状态，并解决第四版，第五版中的异步问题
 * 第九版 then 参数可以为空，为空时向后传递状态, resolve 函数支持解析 promise 对象
 * 第十版 实现静态 all 方法，实现 静态 resolve 方法，实现 catch 方法，实现 finally 方法
 */

const PENDING = 'pending'
const FULFILLED = 'filled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = ''
  reason = ''
  successFnList = []
  failFnList = []

  constructor(fn) {
    try {
      fn(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }

  resolve = (value) => {
    if (this.status !== PENDING) return
    if (value instanceof MyPromise) return value.then(this.resolve, this.reject)
    this.status = FULFILLED
    this.value = value
    while (this.successFnList.length) this.successFnList.shift()()
  }

  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.failFnList.length) this.failFnList.shift()()
  }

  then(successFn, failFn) {
    successFn = successFn ? successFn : (value) => value
    failFn = failFn
      ? failFn
      : (reason) => {
          throw reason
        }

    const resPromise = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = successFn(this.value)
            resolvePromise(resPromise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = failFn(this.reason)
            resolvePromise(resPromise, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        this.successFnList.push(() => {
          setTimeout(() => {
            try {
              const x = successFn(this.value)
              resolvePromise(resPromise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.failFnList.push(() => {
          setTimeout(() => {
            try {
              const x = failFn(this.reason)
              resolvePromise(resPromise, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return resPromise
  }

  catch(fn) {
    return this.then(undefined, fn)
  }
  // finally fn 的返回值不影响 promise 对象
  finally(fn) {
    // this.then 来解析 this 的状态
    return this.then(
      //  fn() .then 来解析 fn 的状态，但是不会使用它的返回值
      (value) => MyPromise.resolve(fn()).then(() => value),
      (err) =>
        MyPromise.resolve(fn()).then(() => {
          throw err
        })
    )
    // 不能这么写，这么写就不能传递上游（this）的 promise 状态
    // return new MyPromise((resolve, reject) => {
    //   const item = fn()
    //   if (item instanceof MyPromise) {
    //     item.then(resolve, reject)
    //   } else {
    //     resolve(item)
    //   }
    // })
  }

  static resolve(value) {
    if (value instanceof Promise) return value
    return new MyPromise((resolve) => resolve(value))
  }
  // reject 即便是一个 promise 对象，也会再包一层
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }

  static all(list) {
    return new MyPromise((resolve, reject) => {
      const result = []
      let item,
        index = 0
      const addItem = (key, value) => {
        result[key] = value
        index++
        if (index === list.length) {
          resolve(result)
        }
      }
      for (let i = 0; i < list.length; i++) {
        item = list[i]
        if (item instanceof MyPromise) {
          item.then((value) => addItem(i, value), reject)
        } else {
          addItem(i, item)
        }
      }
    })
  }
  // 只要有一个状态改变，那最终结果就是那个状态
  static race(list) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < list.length; i++) {
        MyPromise.resolve(list[i]).then(resolve, reject)
      }
    })
  }

  static allSettled(list) {
    return new MyPromise((resolve, reject) => {
      const res = []
      let item,
        index = 0
      const addItem = (key, value) => {
        res[key] = value
        index++
        if (index === list.length) resolve(res)
      }
      for (let i = 0; i < list.length; i++) {
        item = list[i]
        MyPromise.resolve(item).then(
          (value) => {
            addItem(i, { status: FULFILLED, value })
          },
          (reason) => {
            addItem(i, { status: REJECTED, reason })
          }
        )
      }
    })
  }

  static any(list) {
    return new MyPromise((resolve, reject) => {
      const res = []
      let item,
        index = 0
      const addItem = (key, value) => {
        res[key] = value
        index++
        if (index === list.length) reject(res)
      }
      for (let i = 0; i < list.length; i++) {
        item = list[i]
        MyPromise.resolve(item).then(resolve, (reason) => {
          addItem(i, reason)
        })
      }
    })
  }
}

function resolvePromise(originPromise, value, resolve, reject) {
  if (originPromise === value) {
    return reject(
      new Error('Chaining cycle detected for promise #<Promise>, 死循环')
    )
  }
  if (value instanceof MyPromise) {
    return value.then(resolve, reject)
  }
  resolve(value)
}

const p0 = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve(2000), 2000)
})

const p = new MyPromise((resolve, reject) => {
  // setTimeout(() => {
  // resolve(1)
  resolve(p0)
  // reject(1)
  // throw new Error('promise')
  // }, 2000)
})

// p.then(
//   (res) => {
//     console.log('++++', res)
//     return 123
//   },
//   (err) => {
//     console.log('----', err?.message ?? err)
//     // throw new Error('then')
//   }
// ).then(
//   (res) => {
//     console.log('=====', res)
//   },
//   (err) => {
//     console.log('then', err?.message)
//   }
// )

const pa = MyPromise.all([
  1,
  2,
  MyPromise.resolve(3),
  new MyPromise((resolve) => {
    setTimeout(() => resolve(4), 2000)
  })
])

pa.then((res) => {
  console.log('aaaaaa', res)
})
