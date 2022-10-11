/**
 * 请实现一个队列处理程序，当传入任务队列时，能够串行地处理完任务，
 * 如果传入的任务包含异步执行，那么必须确保异步执行完毕之后才会执行后面的任务。
 *
 */

// 茂神解法，promise，
function runQueue(queue) {
  queue.reduce(
    (p, cur) => p.then(() => new Promise((resolve) => cur(resolve))),
    Promise.resolve()
  )
}
// 茂神解法解读
function runQueue(queue) {
  queue.reduce((p, cur) => {
    // reduce 返回 promise
    return p.then(() => {
      // then 的回调返回一个新的 promise，这个promise 等 cur 执行才会改变状态
      return new Promise((resolve) => cur(resolve))
    })
  }, Promise.resolve())
}

// 冬瓜解法1 async
async function queue(list) {
  for (let index = 0; index < list.length; index++) {
    const element = list[index]
    await makePromise(element)
  }
}

function makePromise(fn) {
  return new Promise((resolve) => {
    fn(resolve)
  })
}

// 冬瓜解法2

function runQueue(queue) {
  const list = reduceRight(queue)
  list()
}

function reduceRight(list) {
  return [...list].reverse().reduce(
    (prev, cur) => {
      return function callback() {
        return cur(prev)
      }
    },
    () => {}
  )
}

// tang 佬解法
function queue(list) {
  const step = (index) => {
    const cb = () => {
      step(++index)
    }
    if (index < list.length) {
      list[index](cb)
    }
  }
  step(0)
}

// 鸡哥解法，跟 tang 类似
function runQueue(tasks) {
  tasks = [...tasks]
  const step = () => {
    const run = tasks.shift()
    if (run) {
      run(step)
    }
  }
  step()
}

function task1(next) {
  setTimeout(() => {
    console.log(1)
    next()
  }, 1000)
}

function task2(next) {
  console.log(2)
  next()
}

function task3(next) {
  setTimeout(() => {
    console.log(3)
    next()
  }, 200)
}

// queue([task1, task2, task3])
runQueue([task1, task2, task3])
