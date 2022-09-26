/**
 * 第一版 建立基本的 MyPromise
 * 第二版 支持异步修改状态
 * 第三版 同一个 MyPromise 对象可以添加多个 then 方法
 * 第四版 支持链式调用，promise 返回基础值(未完善)
 * 第五版 链式调用支持返回 promise(未完善)
 * 第六版 支持抛出 promise 返回自身陷入循环报错
 * 第七版 支持捕获 MyPromise 实例化时的参数函数报错，以及 then 成功回调的报错
 * 第八版 链式调用支持其他状态，并解决第四版，第五版中的异步问题
 * 第九版 then 参数可以为空
 * 第十版 实现静态 all resolve  catch  finally race allSettled
 */

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
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
    } catch (error) {
      this.reject(error)
    }
  }

  resolve = (value) => {
    if (this.status !== PENDING) return
    if (value instanceof MyPromise) {
      return value.then(this.resolve, this.reject)
    }
    this.status = FULFILLED
    this.value = value
    while (this.successFnList.length) this.successFnList.shift()(value)
  }

  reject = (reason) => {
    if (this.status !== PENDING) return
    this.status = REJECTED
    this.reason = reason
    while (this.failFnList.length) this.failFnList.shift()(reason)
  }

  then(successFn, failFn) {
    const resPromise = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = successFn(this.value)
            finishPromise(resPromise, x, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const reason = failFn(this.reason)
            finishPromise(resPromise, reason, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else {
        this.successFnList.push(() => {
          setTimeout(() => {
            try {
              const x = successFn(this.value)
              finishPromise(resPromise, x, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.failFnList.push(() => {
          setTimeout(() => {
            try {
              const reason = failFn(this.reason)
              finishPromise(resPromise, reason, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return resPromise
  }
}

function finishPromise(originPromise, x, resolve, reject) {
  if (x === originPromise) {
    reject(
      new TypeError('Chaining cycle detected for promise #<MyPromise>, 死循环')
    )
  }
  if (x instanceof MyPromise) {
    x.then(
      (value) => resolutionProcedure(promise2, value, resolve, reject),
      reject
    )
  } else {
    resolve(x)
  }
}

const p0 = new MyPromise((resolve, reject) => {
  resolve(0)
})

const p = new MyPromise((resolve, reject) => {
  //   setTimeout(() => {
  //   resolve(1)
  //   throw new Error('123')
  resolve(p0)
  //   }, 2000)
})

p.then(
  (value) => {
    console.log('++++', value)
    return 3
  },
  (err) => {
    console.log('---', err.message)
    // throw new Error('then error')
  }
).then(
  (value) => {
    console.log('======', value)
  },
  (err) => {
    console.log(err.message)
  }
)
