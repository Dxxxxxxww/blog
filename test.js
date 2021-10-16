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
