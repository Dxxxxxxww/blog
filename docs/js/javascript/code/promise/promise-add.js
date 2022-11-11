// 题目
// 假设本地机器无法做加减乘除运算，需要通过远程请求让服务端来实现。
// 以加法为例，现有远程API的模拟实现

const addRemote = async (a, b) =>
  new Promise((resolve) => {
    setTimeout(() => resolve(a + b), 1000)
  })

// 请实现本地的add方法，调用addRemote，能最优的实现输入数字的加法。
// async function add(...inputs) {
//   // 你的实现
// }

// 请用示例验证运行结果:
add(1, 2).then((result) => {
  console.log(result) // 3
})

add(3, 5, 2).then((result) => {
  console.log(result) // 10
})

const memo = {}
const getComputedPromise = (a, b) => {
  let key = ''
  key = a > b ? `${b}-${a}` : `${a}-${b}`
  return memo[key] || addRemote(a, b)
}

const setComputedPromise = (a, b, remotePromise) => {
  let key = ''
  key = a > b ? `${b}-${a}` : `${a}-${b}`
  memo[key] = remotePromise
}
async function add(...args) {
  if (!args.length) return 0
  const promises = []
  const _add = (...args) => {
    if (!args.length) return 0
    const [a, b, ...other] = args
    if (!a || !b) {
      promises.push(Promise.resolve(a || b || 0))
    } else {
      const curPromise = getComputedPromise(a, b)
      promises.push(curPromise)
      setComputedPromise(a, b, curPromise)
    }
    _add(...other)
  }
  _add(...args)
  return Promise.all(promises).then((res) => {
    if (res.length === 1) return res[0]
    return add(...res)
  })
}

add().then((res) => console.log(res)) // 0

add(2).then((res) => console.log(res)) // 2

add(
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2
).then((res) => console.log(res)) // 45

add(
  0,
  3,
  5,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2,
  1,
  2
).then((res) => console.log(res)) // 55
