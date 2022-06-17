/**
 * 请实现一个队列处理程序，当传入任务队列时，能够串行地处理完任务，
 * 如果传入的任务包含异步执行，那么必须确保异步执行完毕之后才会执行后面的任务。  */

// async function queue(list) {
//   while (list.length) {
//     await makePromise(list.shift())
//   }
// }

// function makePromise(fn) {
//   return new Promise((resolve) => {
//     fn(resolve)
//   })
// }

// function reduceRight(list) {
//   return [...list].reverse().reduce(
//     (prev, cur) => {
//       return function callback() {
//         return cur(prev)
//       }
//     },
//     () => {}
//   )
// }

function runQueue(list) {
  const fn = reduceRight(list)
  console.log(fn)
  fn()
}

function reduceRight(list) {
  const r = list.reverse()
  // [task3, task2, task1]
  // runQueue([task1, task2, task3])
  console.log(r)
  return r.reduce(
    (res, cur) => {
      return function inner() {
        console.log(cur)
        return cur(res)
      }
    },
    () => {}
  )
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
