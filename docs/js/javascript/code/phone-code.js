// 生成手机验证码

// 允许重复
function randomCodeV1(count) {
  let res = String(Math.random() * Math.pow(10, count)).split('.')[0]
  const length = res.length
  if (count - length > 0) {
    res = res.padStart(count, '0')
  }
  return res
}

// 不允许重复
function randomCodeV2(count) {
  let res = String(Math.random()).split('').slice(2)

  const set = new Set(res)
  res = [...set]
  if (res.length >= count) {
    res = res.slice(0, count)
  } else {
    // 保存已存在的数字
    const cache = new Array(9)
    for (const val of res) {
      cache[val] = true
    }
    let i = 0
    while (res.length === count) {
      // 不存在则添加到结果中
      if (!cache[i]) {
        res.push(i)
      }
      i++
    }
  }

  return res.join('')
}

let res
for (let i = 0; i < 100; i++) {
  res = randomCodeV1(6)
  res = randomCodeV2(6)
}
