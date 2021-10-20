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

const p = new MyPromise((resolve, reject) => {
    setTimeout(() => resolve("成功"), 2000);
    // resolve('成功')
});

const p2 =p.then(function a(v) {
    console.log(123,v);
    return 100;
})

p2.then(function b(v) {
    console.log(456,v);
});
