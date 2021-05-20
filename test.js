function red() {
  console.log('red')
}
function green() {
  console.log('green')
}
function yellow() {
  console.log('yellow')
}

function p(t, cb) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      cb()
      resolve()
    }, t)
  })
}
// 这里需要返回 p(1000, green) 函数执行，而不是返回 undefined 是因为需要等待相应的秒数后再执行 resolve （pending->resolved）
// 如果返回 undefined then 所返回的新的 promise 就已经是 resolved 状态了，
// new Promise(resolve=>{
//   return resolve(1)
// }).then(res=>{
//   console.log(res)
// }).then(res=>{
//   console.log(res)
//   return undefined
// }).then(res=>{
//   console.log(res)
// }) 输出 1 undefined undefined  Promise {<fulfilled>: undefined}

const step = () => {
  p(3000, red)
    .then(() => {
      return p(1000, green)
      // return undefined
    })
    .then(() => {
      return p(2000, yellow)
      // return undefined
    })
    .then(step)
}
step()

// const task = (timer, light) =>
//     new Promise((resolve, reject) => {
//         setTimeout(() => {
//             if (light === 'red') {
//                 red()
//             }
//             else if (light === 'green') {
//                 green()
//             }
//             else if (light === 'yellow') {
//                 yellow()
//             }
//             resolve()
//         }, timer)
//     })

// const step = () => {
//     task(3000, 'red')
//         .then(() => task(1000, 'green'))
//         .then(() => task(2000, 'yellow'))
//         .then(step)
// }

// step()
