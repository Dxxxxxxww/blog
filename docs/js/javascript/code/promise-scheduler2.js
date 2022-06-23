// 实现一个 promise.map，限制 promise 并发数
/**
 * pMap([1, 2, 3, 4, 5], (x) => Promise.resolve(x + 1));

pMap([Promise.resolve(1), Promise.resolve(2)], (x) => x + 1);

// 注意输出时间控制
pMap([1, 1, 1, 1, 1, 1, 1, 1], (x) => sleep(1000), { concurrency: 2 });
 */

// 鹏哥写法

function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

function pMap(data, fn, options) {
  data = [...data]
  async function next() {
    let cur = data.shift()
    if (cur === undefined) {
      return
    }
    cur = Promise.resolve(cur)
    const x = await cur
    const res = await fn(x)
    console.log(res)
    next()
  }
  for (let i = 0; i < (options?.concurrency || 1); i++) {
    next()
  }
}

pMap([1, 2, 3, 4, 5], (x) => Promise.resolve([x + 1]))
// pMap([Promise.resolve(1), Promise.resolve(2)], (x) => x + 1)
// pMap([1, 1, 1, 1, 1, 1, 1, 1], (x) => sleep(1000), { concurrency: 2 })
