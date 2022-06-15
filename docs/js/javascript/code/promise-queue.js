/**
 * 请实现一个队列处理程序，当传入任务队列时，能够串行地处理完任务，
 * 如果传入的任务包含异步执行，那么必须确保异步执行完毕之后才会执行后面的任务。  */

// function queue(list) {
//   let next
//   const p = new Promise((resolve) => {
//     next = resolve
//   })
//   while (list.length) {}
// }

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

queue([task1, task2, task3])
