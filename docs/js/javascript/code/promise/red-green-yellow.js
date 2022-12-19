// 红灯三秒亮一次，绿灯一秒亮一次，黄灯2秒亮一次；如何让三个灯不断交替重复亮灯？（用 Promise 实现）
// 三个亮灯函数已经存在：
function red() {
  console.log('red')
}
function green() {
  console.log('green')
}
function yellow() {
  console.log('yellow')
}

function makePromise(fn, time) {
  return new Promise((resolve) => {
    setTimeout(() => {
      fn()
      resolve()
    }, time * 1e3)
  })
}

function run() {
  makePromise(red, 3)
    .then(() => makePromise(green, 1))
    .then(() => makePromise(yellow, 2))
    .then(() => {
      run()
    })
}

run()

function red() {
  console.log('red')
}
function green() {
  console.log('green')
}
function yellow() {
  console.log('yellow')
}

function getWrapperTask(tasks) {
  return tasks.map((task, index) => {
    const timeMap = {
      red: 3000,
      green: 1000,
      yellow: 2000
    }
    return () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(task())
        }, timeMap[task.name])
      })
  })
}

function runTask() {
  const tasks = getWrapperTask([red, green, yellow])
  const res = tasks.reduce(
    (cur, taskWrapper) => cur.then(() => taskWrapper()),
    Promise.resolve()
  )
  res.then(() => runTask())
}

runTask()
