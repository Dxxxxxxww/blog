# 手写 Promise

## 第一版 建立基本的 Promise

要手写模拟 promise，我们首先需要知道 Promise 的功能特点是什么，所以下面先写一个 Promise 使用 demo。

```js
const p = new Promise((resolve, reject) => {
    // 修改状态为成功，且不可更改
    resolve("成功");
    // 修改状态为失败，且不可更改
    reject("失败");
});

p.then(
    value => {
        console.log(value);
    },
    err => {
        console.log(err);
    }
);
```

通过观察上面代码，我们可以获得以下几点信息：

1. Promise 是一个类；
2. Promise 实例化时需要传入一个回调函数，回调函数接受两个可以更改状态的方法 resolve，reject，状态一经更改不可在变；
3. 这两个函数需要使用箭头函数来编写，否则 this 会指向 window；
4. Promise 具有 then 方法，可以接受两个函数参数，用来处理状态改变后的结果。

```js
// 开始模拟
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
    // 状态
    status = PENDING;
    // then 接受的参数
    value = undefined;
    // catch 接受的参数
    reason = undefined;

    constructor(callback) {
        callback(this.resolve, this.reject);
    }

    resolve = value => {
        if (this.status !== PENDING) return;
        this.status = FULFILLED;
        this.value = value;
    };

    reject = reason => {
        if (this.status !== PENDING) return;
        this.status = REJECTED;
        this.reason = reason;
    };

    then(success, fail) {
        if (this.status === FULFILLED) {
            return success(this.value);
        } else if (this.status === REJECTED) {
            return fail(this.reason);
        }
    }
}

const p = new MyPromise((resolve, reject) => {
    // 修改状态为成功，且不可更改
    resolve("成功");
    // 修改状态为失败，且不可更改
    reject("失败");
});

p.then(
    value => {
        console.log(value);
    },
    err => {
        console.log(err);
    }
);
```

## 第二版 支持异步

```js
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

class MyPromise {
    // promise 状态
    status = PENDING;
    // resolve 参数
    value = undefined;
    // reject 参数
    reason = undefined;
    handleSuccess = undefined;
    handleFail = undefined;

    constructor(callback) {
        callback(this.resolve, this.reject);
    }

    resolve = value => {
        if (this.status === PENDING) {
            this.status = FULFILLED;
        }
        this.value = value;
        this.handleSuccess(value);
    };

    reject = reason => {
        if (this.status === PENDING) {
            this.status = REJECTED;
        }
        this.reason = reason;
        this.handleFail(reason);
    };

    then(success, fail) {
        if (this.status === FULFILLED) {
            success(this.value);
        } else if (this.status === REJECTED) {
            fail(this.reason);
        } else {
            this.handleSuccess = success;
            this.handleFail = fail;
        }
    }
}

const p = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve("成功");
    }, 2000);
});

p.then(
    value => {
        console.log(value);
    },
    () => {}
);
```
