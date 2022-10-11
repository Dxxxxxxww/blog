const obj = {
  a: {
    b: 1,
    c: 2,
    d: { e: 5 }
  },
  b: [1, 3, { a: 2, b: 3 }],
  c: 3
}

function isObject(obj) {
  return !!obj && typeof obj === 'object'
}

function flatten(obj) {
  if (!isObject(obj)) return
  const res = {}
  const dfs = (val, key) => {
    if (isObject(val)) {
      if (Array.isArray(val)) {
        val.forEach((item, index) => {
          dfs(item, `${key}[${index}]`)
        })
      } else {
        for (const k in val) {
          if (Object.hasOwnProperty.call(val, k)) {
            const item = val[k]
            dfs(item, `${key ? key + '.' : ''}${k}`)
          }
        }
      }
    } else {
      res[key] = val
    }
  }
  dfs(obj, '')
  return res
}
// 鹏哥写法
function flatten2(root) {
  const map = {}
  const stack = []
  const travers = (obj) => {
    for (const key in obj) {
      const item = obj[key]
      stack.push(key)
      if (typeof item !== 'object') {
        const newKey = stack.join('.').replace(/.(\d+)/g, (_, t) => {
          return `[${t}]`
        })
        map[newKey] = item
      } else {
        travers(item)
      }
      stack.pop()
    }
  }
  travers(root)
  return map
}

// console.log(flatten(obj))
console.log(flatten2(obj))
