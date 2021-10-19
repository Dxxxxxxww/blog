# 手写 Promise

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

const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  status = PENDING;
  value = undefined;
  reason = undefined;
  // 使用数组来存储多个 then 中的回调
  handleSuccess = [];
  handleFail = [];

  constructor(callback) {
    callback(this.resolve, this.reject);
  }

  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.value = value;
    this.status = FULFILLED;

    while (this.handleSuccess.length) {
      this.handleSuccess.shift()(value);
    }
  };

  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.reason = reason;
    this.status = REJECTED;

    while (this.handleFail.length) {
      this.handleFail.shift(reason);
    }
  };

  then(success, fail) {
    if (this.status === FULFILLED) {
      success(this.value);
    } else if (this.status === REJECTED) {
      fail(this.reason);
    } else {
      this.handleSuccess.push(success);
      this.handleFail.push(fail);
    }
  }
}

const p = new MyPromise((resolve, reject) => {
  resolve("成功");
});

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
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  status = PENDING;
  value = undefined;
  reason = undefined;
  // 同一个 promise 对象可以调用多个 then 方法(不是链式调用)，所以使用函数保存
  handleSuccess = [];
  handleFail = [];

  constructor(callback) {
    callback(this.resolve, this.reject);
  }

  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.value = value;
    this.status = FULFILLED;
    while (this.handleSuccess.length) {
      // 当异步完成时执行处理函数
      this.handleSuccess.shift()(value);
    }
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.reason = reason;
    this.status = REJECTED;
    while (this.handleFail.length) {
      // 当异步完成时执行处理函数
      this.handleFail.shift()(reason);
    }
  };
  then(success, fail) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        resolve(success(this.value));
      } else if (this.status === REJECTED) {
        reject(fail(this.reason));
      } else {
        // 异步时先将处理函数保存下来
        success && this.handleSuccess.push(success);
        fail && this.handleFail.push(fail);
      }
    });
  }
}

const p = new Promise((resolve, reject) => {
  // 这一版在处理异步时有问题，第二个 then
    不会调用
  // setTimeout(() => resolve("成功"), 2000);
  resolve('成功')
});

p.then(function a(v) {
  console.log(v);
  return 100;
}).then(function b(v) {
  console.log(v);
});

// 成功
// 100
```

## 第五版 链式调用支持返回 promise

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
  status = PENDING;
  value = undefined;
  reason = undefined;
  // 同一个 promise 对象可以调用多个 then 方法(不是链式调用)，所以使用函数保存
  handleSuccess = [];
  handleFail = [];

  constructor(callback) {
    callback(this.resolve, this.reject);
  }

  resolve = (value) => {
    if (this.status !== PENDING) return;
    this.value = value;
    this.status = FULFILLED;
    while (this.handleSuccess.length) {
      // 当异步完成时执行处理函数
      this.handleSuccess.shift()(value);
    }
  };
  reject = (reason) => {
    if (this.status !== PENDING) return;
    this.reason = reason;
    this.status = REJECTED;
    while (this.handleFail.length) {
      // 当异步完成时执行处理函数
      this.handleFail.shift()(reason);
    }
  };
  then(success, fail) {
    return new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        const res = success(this.value);
        resolvePromise(res, resolve, reject);
      } else if (this.status === REJECTED) {
        reject(fail(this.reason));
      } else {
        // 异步时先将处理函数保存下来
        success && this.handleSuccess.push(success);
        fail && this.handleFail.push(fail);
      }
    });
  }
}

const resolvePromise = (value, resolve, reject) => {
  if (value instanceof MyPromise) {
    value.then(resolve, reject);
  } else {
    resolve(value);
  }
};

const p = new MyPromise((resolve, reject) => {
  // setTimeout(() => resolve("成功"), 2000);
  resolve("成功");
});

const p2 = new MyPromise((resolve) => {
  resolve("other");
});

p.then(function a(v) {
  console.log(v);
  return p2;
}).then(function b(v) {
  console.log(v);
});

```

## 第六版 支持抛出 promise 返回自身陷入循环报错

```js
const promise = new Promise((resolve, reject) => {
    resolve(100)
})

const p2 = promise.then(() => p2)

p2.catch(err => console.log(err)) // TypeError: Chaining cycle detected for promise #<Promise>
```

由上述代码可知，当一个 promise.then 返回的 promise 与 promise.then 中的 success 方法返回值相同时，就会报错。以下是代码实现：

```js
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
    callback(this.resolve, this.reject);
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
          const res = success(this.value);
          resolvePromise(promise2, res, resolve, reject);
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
    if (promise2 === res) return reject(new TypeError("Chaining cycle detected for promise #<Promise>, 死循环"));
    return res.then(resolve, reject);
  }
  resolve(res);
};

const p = new MyPromise((resolve, reject) => {
  // setTimeout(() => resolve("成功"), 2000);
  resolve("成功");
});

const p2 = p.then(() => p2);

p2.then(
  (v) => {
    console.log(v);
  },
  (err) => {
    console.log(err); // TypeError: Chaining cycle detected for promise #<Promise>, 死循环

  }
);

```

## 第七版 支持捕获 Promise 实例化时的参数函数报错，以及 then 成功回调的报错

```js
// Promise 实例化时的参数函数报错
const p = new Promise((resolve, reject) => {
  throw new Error('123')
})

p.catch(err => {
  console.log(err) // Error: 123
})

// then 成功回调的报错
const p = new Promise((resolve, reject) => {
    resolve(123)
})

p.then(() => {
    throw new Error('abc')
}).catch(err => {
    console.log(err) // Error: abc

})

```
以下是代码实现：
```js
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

const p = new MyPromise((resolve, reject) => {
  throw new Error('123')
});

p.then(
  (v) => {
    console.log(v);
  },
  (err) => {
    console.log(err); // Error: 123
  }
);
// ---
const p = new MyPromise((resolve, reject) => {
  resolve(123);
});

p.then(
  (v) => {
    console.log(v); // 123
    throw new Error("abc");
  },
  (err) => {
    console.log(err);
  }
).then(
  () => {},
  (err) => console.log(`wahaha-${err}`) // wahaha-Error: abc

);

```
