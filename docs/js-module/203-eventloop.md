# Eventloop
<b>在不同的浏览器下，甚至是同一种浏览器的不同版本中，异步任务的执行顺序都会有差异，也就是说他们的优先级并不是完全固定的。

注意，只是异步任务的优先级会有所不同，这主要还是各个浏览器的问题。

所以 winter 也说了这种题作为面试题极为不合适。</b>

[学习资料1](https://juejin.cn/post/6844903827611598862#heading-19)

[学习资料2](https://juejin.cn/post/6844903553795014663#heading-21)

## 一、promise

```js
var p1 = new Promise((resolve, reject) => {
    console.log("promise1");
    resolve("a");
})
    .then(val => {
        console.log("then11", val);
        new Promise((resolve, reject) => {
            console.log("promise2");
            resolve("b");
        })
            .then(val => {
                console.log("then21", val);
                return "c";
            })
            .then(val => {
                console.log("then23", val);
                Promise.resolve()
                    .then(() => {
                        console.log("then23里的 then");
                        return "d";
                    })
                    .then(val => {
                        console.log("then24", val);
                        return "e";
                    });
                return "f";
            })
            .then(val => {
                console.log("then25", val);
                return "g";
            });
        return "z";
    })
    .then(val => {
        console.log("then12", val);
    });

  
  // 输出
  // promise1
  // then11 a
  // promise2
  // then21 b
  // then12 z
  // then23 c
  // then23里的 then
  // then25 f
  // then24 d

  // 这里的 then23，then23里的 then，then25 是同一轮微任务
```


```js
var p2 = new Promise((resolve, reject) => {
    console.log("promise1");
    resolve("a");
})
    .then(val => {
        console.log("then11", val);
        new Promise((resolve, reject) => {
            console.log("promise2");
            resolve("b");
        })
            .then(val => {
                console.log("then21", val);
                return "c";
            })
            .then(val => {
                console.log("then23", val);
                return Promise.resolve()
                    .then(() => {
                        console.log("then23里的 then");
                        return "d";
                    })
                    .then(val => {
                        console.log("then24", val);
                        return "e";
                    });
            })
            .then(val => {
                console.log("then25", val);
                return "f";
            })
            .then(val => {
                console.log("then26", val);
                return "g";
            });
        return "z";
    })
    .then(val => {
        console.log("then12", val);
    });

  
  // 输出
  // promise1
  // then11 a
  // promise2
  // then21 b
  // then12 z
  // then23 c
  // then23里的 then
  // then24 d
  // then25 e
  // then26 f
  // 这里的 then23，then23里的 then 是同一轮微任务
  // then24 是下一轮
  // then25 由于 return 新的 promise 的原因变为 下下轮
```
上面两段代码的唯一区别是 <code>then23里的 then</code> 这一个 <code>promise</code> 是否 <code>return</code>。这里其实是 <code>promise</code> 的特性：<b>如果在 '当前then' 中手动返回一个新的 promise 则会使紧跟着 '当前then' 之后的 '后then' 拼接到 '新Promise的then' 末尾（在本代码中指 then25 拼接到 then24 之后）。（个人理解）进入到下一轮 微任务中，而不是本轮。</b>

```js
var p2 = new Promise((resolve, reject) => {
    console.log("promise1");
    resolve("a");
})
    .then(val => {
        console.log("then11", val);
        return new Promise((resolve, reject) => {
            console.log("promise2");
            resolve("b");
        })
            .then(val => {
                console.log("then21", val);
                return "c";
            })
            .then(val => {
                console.log("then23", val);
                return Promise.resolve()
                    .then(() => {
                        console.log("then23里的 then");
                        return "d";
                    })
                    .then(val => {
                        console.log("then24", val);
                        return "e";
                    });
            })
            .then(val => {
                console.log("then25", val);
                return "f";
            })
            .then(val => {
                console.log("then26", val);
                return "g";
            });
    })
    .then(val => {
        console.log("then12", val);
    });

// 输出
// promise1
// then11 a
// promise2
// then21 b
// then23 c
// then23里的 then
// then24 d
// then25 e
// then26 f
// then12 g
// 同理，then12 变为最后一轮
```