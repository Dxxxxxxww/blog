// 并发控制4
// 实现 asyncPool 函数，最后一个参数是当前请求的并发数量

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
// async 版本
async function asyncPool(fn, list, concurrency = 2) {
    let count = 0
    const queue = []
    const runQueue = async (city) => {
        if (count >= concurrency) {
            await new Promise((resolve) => {
                queue.push(resolve)
            })
        }
        let res
        count++
        res = await fn(city)
        count--
        if (queue.length) {
            await queue.shift()()
        }
        console.log(res)
        return res
    }
    return await Promise.all(list.map( (city) => {
        // console.log(runQueue(city))
        return runQueue(city)
    }))
}

// promise 版本
function asyncPool2(fn, list, concurrency = 2) {
  let count = 0;
  const queue = []
  const runQueue = (city) => {
    // 返回 promise
    return new Promise((resolve) => {
      // 阻塞
      new Promise((subResolve) => {
        if (count >= concurrency) {
          queue.push(subResolve)
        } else {
          count++
          subResolve()
        }
      }).then(() =>{
        fn(city).then((res) => {
          count--
          resolve(res)
          // console.log(res)
          queue.length && queue.shift()()
        })
      })
    })
  }

  const result = []
  return new Promise((resolve) => {
    list.forEach((city, index) => {
      runQueue(city).then((res) => {
        console.log(res)
        result.push(res)
        if (index === list.length - 1) {
          console.log('haha')
          resolve(result)
        }
      })
    })
  })


  // for (let i = 0; i < list.length; i++) {
  //   const city = list[i]
  //   // 模拟用户不停输入
  //   if (i < 3) {
  //
  //     list.push(`hz${i}`)
  //   }
  //   runQueue(city).then((res) => {
  //     console.log(res)
  //   })
  // }
}

asyncPool(getWeather, citys, 2).then((results) => console.log(results))
asyncPool2(getWeather, citys, 2).then((results) => console.log(results))
