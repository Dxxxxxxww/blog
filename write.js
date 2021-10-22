// js中流行异步编程是因为在最开始的时候，网页没有那么多花里胡哨的功能，只是做展示用，
// js被设计出来是为了操作dom的，所以js被设计为单线程的语言，也完全够用。而随着后来发展，
// 网页有了其他丰富多彩的功能，用户交互啊，请求服务器数据啊，动画展示，3d模型等等，这时候单线程的JS执行同步函数会导致用户无法操作，出现“卡死”的情况，而异步就是为了解决这一情况，避免异步操作与用户操作产生冲突。
// 虽然js是单线程的，但是浏览器并不是。浏览器是多进程的。

// eventloop 可以说是 js 为了解决异步而实现的一个模型。js执行时会有一个执行栈空间，一个消息队列和一个微任务队列，(一般宏任务都会有额外的线程去处理，比如说定时器)。当主代码执行时，会首先将全局环境作为一个匿名函数放入执行栈中，每调用一个函数，就会让该函数入栈，执行完了就出栈。当有异步代码时，比如说setTimeout(宏任务)函数执行，会入栈出栈，然后它的回调会给对应的定时器线程管理，当 setTimeout 的定时到期了，就会将该回调放入消息队列中，当所有代码执行完，执行栈为空的时候，会先去查看微任务队列是否有任务，如果微任务队列有任务，会优先将微任务队列中的所有任务处理完，再会把消息队列中的任务按照先进先出的顺序拿到执行栈中执行。

// 消息队列就是保存宏任务回调的一个地方。

// 常见的微任务有 Promise.then , MutationObserver(监听dom变化的事件), node环境下的 process.nextTick
// 除了上面的微任务以外的异步任务都是宏任务，比如 setTimeout, setInterval,输入输出操作,事件等。

// const PENDING = "pending";
// const FULFILLED = "fulfilled";
// const REJECTED = "rejected";

// class MyPromise {
//     status = PENDING;
//     value = undefined;
//     reason = undefined;
//     // 同一个 promise 对象可以调用多个 then 方法(不是链式调用)，所以使用函数保存
//     handleSuccess = [];
//     handleFail = [];

//     constructor(callback) {
//         callback(this.resolve, this.reject);
//     }

//     resolve = (value) => {
//         if (this.status !== PENDING) return;
//         this.value = value;
//         this.status = FULFILLED;
//         while (this.handleSuccess.length) {
//             // 当异步完成时执行处理函数
//             this.handleSuccess.shift()(value);
//         }
//     };
//     reject = (reason) => {
//         if (this.status !== PENDING) return;
//         this.reason = reason;
//         this.status = REJECTED;
//         while (this.handleFail.length) {
//             // 当异步完成时执行处理函数
//             this.handleFail.shift()(reason);
//         }
//     };
//     then(success, fail) {
//         return new MyPromise((resolve, reject) => {
//             if (this.status === FULFILLED) {
//                 resolve(success(this.value));
//             } else if (this.status === REJECTED) {
//                 reject(fail(this.reason));
//             } else {
//                 // 异步时先将处理函数保存下来
//                 success && this.handleSuccess.push(success);
//                 fail && this.handleFail.push(fail);
//             }
//         });
//     }
// }

// const p = new MyPromise((resolve, reject) => {
//     setTimeout(() => resolve("成功"), 2000);
//     // resolve('成功')
// });

// const p2 =p.then(function a(v) {
//     console.log(123,v);
//     return 100;
// })

// p2.then(function b(v) {
//     console.log(456,v);
// });
