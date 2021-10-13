// const p = new Promise((resolve, reject) => {
//   // 修改状态为成功，且不可更改
//   resolve('成功')
//   // 修改状态为失败，且不可更改
//   reject('失败')
// })

// p.then(
//   (value) => {
//     console.log(value)
//   },
//   (err) => {
//     console.log(err)
//   }
// )

const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  // 状态
  state = PENDING
  // then 接受的参数
  value = undefined
  // catch 接受的参数
  reason = undefined

  constructor(callback) {
    callback(this.resolve, this.reject)
  }

  resolve = (value) => {
    if (this.state !== PENDING) return
    this.state = FULFILLED
    this.value = value
  }

  reject = (reason) => {
    if (this.state !== PENDING) return
    this.state = REJECTED
    this.reason = reason
  }

  then(success, fail) {
    if (this.state === FULFILLED) {
      return success(this.value)
    } else if (this.state === REJECTED) {
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
