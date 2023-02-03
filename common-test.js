function getWeather(city) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ temperature: (Math.random() * 30) >>> 0, city })
    }, 2000) //(Math.random() * 5) >>> 0
  })
}

let citys = [
  '北京',
  '上海',
  '杭州',
  '成都',
  '武汉',
  '天津',
  '深圳',
  '广州',
  '合肥',
  '郑州'
]

function runQueue(citys, fn, limit = 1) {
  let queue = [],
    count = 0
  const next = async (param) => {
    if (count >= limit) {
      await new Promise((resolve) => {
        queue.push(resolve)
      })
    }
    count++
    const res = await fn(param)
    count--
    console.log(res)
    if (queue.length) {
      queue.shift()()
    }
  }
  const res = Promise.all(citys.map((city) => next(city)))
  console.log(res)
  return res
}

runQueue(citys, getWeather, 2).then((results) => console.log(results))
