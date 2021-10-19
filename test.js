const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  status = PENDING;
  value = undefined;
  reason = undefined;
  handleSuccess = [];
  handleFail = [];

  constructor(callback) {
    try {
      callback(this.resolve, this.reject);
    } catch (e) {
      this.reject(e);
    }
  }
  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    while (this.handleSuccess.length) this.handleSuccess.shift()(value);
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    while (this.handleFail.length) this.handleFail.shift()(reason);
  };
  then(success, fail) {
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过 setTimeout 产生异步，使 resolvePromise 可以拿到 p2
        setTimeout(() => {
          try {
            const res = success(this.value);
            resolvePromise(promise2, res, resolve, reject);
          } catch (e) {
            reject(e);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        fail(this.reason);
      } else {
        this.handleSuccess.push(success);
        this.handleFail.push(fail);
      }
    });
    return promise2;
  }
}

const resolvePromise = (promise2, res, resolve, reject) => {
  if (res instanceof MyPromise) {
    if (promise2 === res)
      return reject(
        new TypeError("Chaining cycle detected for promise #<Promise>, 死循环")
      );
    return res.then(resolve, reject);
  }
  resolve(res);
};
//
// const p = new MyPromise((resolve, reject) => {
//   throw new Error('123')
// });
//
// p.then(
//   (v) => {
//     console.log(v);
//   },
//   (err) => {
//     console.log(err); // Error: 123
//   }
// );

const p = new MyPromise((resolve, reject) => {
  resolve(123);
});

p.then(
  (v) => {
    console.log(v);
    throw new Error("abc");
  },
  (err) => {
    console.log(err);
  }
).then(
  () => {},
  (err) => console.log(`wahaha-${err}`) // Error: abc

);
