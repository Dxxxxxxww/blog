// 并发控制。实现一个 promise.map，限制 promise 并发数
/**
 * pMap([1, 2, 3, 4, 5], (x) => Promise.resolve(x + 1));

pMap([Promise.resolve(1), Promise.resolve(2)], (x) => x + 1);

// 注意输出时间控制
pMap([1, 1, 1, 1, 1, 1, 1, 1], (x) => sleep(1000), { concurrency: 2 });

function sleep(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout)
  })
}

 */

async function pMap(list, fn, options = {}) {
  list = [...list]
  let count = 0
  let limit = options.concurrency || 1
  const tasks = []
  const next = async (param) => {
    if (count >= limit) {
      await new Promise((resolve) => {
        tasks.push(resolve)
      })
    }
    count++
    const res = await fn(param)
    count--
    console.log(res)
    if (tasks.length) {
      tasks.shift()()
    }
  }
  const res = await Promise.all(
    list.map((param) => {
      return next(param)
    })
  )
  return res
}

function pMap2(list, fn, options = {}) {
  let count = 0
  let limit = options.concurrency || 1
  const tasks = []
  const next = (param) => {
    return new Promise((resolve) => {
      if (count >= limit) {
        tasks.push(resolve)
      } else {
        count++
        resolve()
      }
    }).then(() => {
      return fn(param).then((res) => {
        console.log(res)
        count--
        if (tasks.length) {
          tasks.shift()()
        }
        return res
      })
    })
  }

  Promise.all(
    list.map((param) => {
      return next(param)
    })
  )
}

function pMap3(list, fn, options) {
  list = [...list]
  //   const next = async () => {
  //     if (!list.length) {
  //       return
  //     }
  //     let param = list.shift()
  //     param = await param
  //     const res = await fn(param)
  //     console.log(res)
  //     next()
  //   }
  const next = async () => {
    while (list.length) {
      let param = list.shift()
      param = await param
      const res = await fn(param)
      console.log(res)
    }
  }
  for (let i = 0; i < (options?.concurrency || 1); i++) {
    next()
  }
}

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

pMap(
  [1, 2, 3, 4, 5],
  (x) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(x)
      }, 2000)
    }),
  { concurrency: 2 }
)
// pMap([1, 2, 3, 4, 5], (x) => Promise.resolve([x + 1]))
// pMap([Promise.resolve(1), Promise.resolve(2)], (x) => x + 1)
// pMap([1, 1, 1, 1, 1, 1, 1, 1], (x) => sleep(1000), { concurrency: 2 })
