function cloneDeep(data, map = new WeakMap()) {
  if (!data) return
  let cloneData
  // 解决循环引用
  if (map.get(data)) {
    return data
  }
  map.set(data, true)
  if (typeof data === 'object') {
    if (Array.isArray(data)) {
      cloneData = []
      data.forEach((item, index) => {
        cloneData[index] = cloneDeep(item, map)
      })
    } else {
      cloneData = {}
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          const item = data[key]
          cloneData[key] = cloneDeep(item, map)
        }
      }
    }
    return cloneData
  } else {
    return data
  }
}

const c = [1, 2, [3, [4]], { a: { b: 'c' } }]
const c1 = cloneDeep(c)
c1[3].a = 2
console.log('c1', c1)
console.log('c', c)
