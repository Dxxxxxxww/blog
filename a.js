const data = [
  { a: '1', b: '2' },
  { b: '2', a: '1' },
  { c: 3 },
  { a: { b: 1, c: 2 }, d: 4 },
  { a: { c: 2, b: 1 }, d: 4 }
]

function flatObj(obj, res = {}, parentPath = '') {
  // if (typeof res !== 'object') {
  //   return (res[parentPath] = obj)
  // }
  const keys = Object.keys(obj).sort()

  keys.forEach((key) => {
    const currentKey = parentPath ? `${parentPath}.${key}` : key

    if (typeof obj[key] !== 'object') {
      res[currentKey] = obj[key]
    } else {
      // deepObj(key, obj)
      flatObj(obj[key], res, currentKey)
    }
  })
  return res
}

function loop(list) {
  const set = new Set()
  return list.filter((item) => {
    const key = JSON.stringify(flatObj(item))
    if (set.has(key)) {
      return false
    }

    set.add(key)
    return true
  })
}

console.log(loop(data))
