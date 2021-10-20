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
    // 更改状态，保存值供下一次 then 方法使用
    resolve = value => {
        if (this.status !== PENDING) return;
        this.status = FULFILLED;
        this.value = value;
        while (this.handleSuccess.length) this.handleSuccess.shift()();
    };
    // 更改状态，保存值供下一次 catch 方法使用
    reject = reason => {
        if (this.status !== PENDING) return;
        this.status = REJECTED;
        this.reason = reason;
        while (this.handleFail.length) this.handleFail.shift()();
    };
    // 查看 promise 状态
    then(success, fail) {
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

const p1 = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve("aaa");
    }, 2000);
});

const p2 = p1.then(
    val => {
        console.log(val);
        return 10000;
    },
    err => {
        console.log(err);
        throw new Error("娃哈哈");
    }
);

p2.then(
    value => {
        console.log(value);
    },
    err => console.log(err)
);

// const p1 = new MyPromise(resolve => {
//     resolve("123");
// });

// const p2 = p1.then(val => {
//     console.log(val);
//     return p2;
// });

// p2.then(
//     () => {},
//     err => console.log(err)
// );
