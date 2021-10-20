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
    } catch (error) {
      this.reject(error);
    }
  }

  static all(arr) {
    const res = [];
    let index = 0;
    return new MyPromise((resolve, reject) => {
      const len = arr.length;
      const addItem = (k, v) => {
        res[k] = v;
        index++;
        if (index === len) {
          resolve(res);
        }
      };
      for (let i = 0; i < len; i++) {
        const current = arr[i];
        if (current instanceof MyPromise) {
          // promise
          current.then((value) => addItem(i, value), reject);
        } else {
          // 其他类型
          addItem(i, current);
        }
      }
    });
  }

  // 更改状态，保存值供下一次 then 方法使用
  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    while (this.handleSuccess.length) this.handleSuccess.shift()();
  };
  // 更改状态，保存值供下一次 catch 方法使用
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    while (this.handleFail.length) this.handleFail.shift()();
  };
  // 查看 promise 状态
  then(success, fail) {
    success = isFunc(success) ? success : (value) => value;
    fail = isFunc(fail)
      ? fail
      : (reason) => {
          throw reason;
        };
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        // 通过异步，拿到 promise2
        setTimeout(() => {
          try {
            const res = success(this.value);
            resolvePromise(promise2, res, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const err = fail(this.reason);
            resolvePromise(promise2, err, resolve, reject);
          } catch (error) {
            reject(error);
          }
        }, 0);
      } else {
        this.handleSuccess.push(() => {
          setTimeout(() => {
            try {
              const res = success(this.value);
              resolvePromise(promise2, res, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
        this.handleFail.push(() => {
          setTimeout(() => {
            try {
              const err = fail(this.reason);
              resolvePromise(promise2, err, resolve, reject);
            } catch (error) {
              reject(error);
            }
          }, 0);
        });
      }
    });
    return promise2;
  }
}

const resolvePromise = (otherPromise, res, resolve, reject) => {
  // 如果是 promise 需要查看其状态，再判断执行 resolve 还是 reject
  if (res instanceof MyPromise) {
    if (otherPromise === res) {
      return reject(
        new TypeError("死循环, Chaining cycle detected for promise")
      );
    }
    return res.then(resolve, reject);
  }
  resolve(res);
};

const isFunc = (func) =>
  Object.prototype.toString.call(func).slice(8, 16) === "Function";

const p = new MyPromise((resolve, reject) => {
  setTimeout(() => resolve("成功"), 2000);
  // setTimeout(() => reject("失败"), 2000);
});
const p2 = new MyPromise((resolve, reject) => {
    resolve('成功222')
  // reject("失败222");
});

MyPromise.all([p, 1, 2, p2, 3, 4]).then(
  (val) => console.log(val),
  (err) => console.log(err)
);
