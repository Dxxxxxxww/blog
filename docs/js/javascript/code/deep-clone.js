const deepClone = (source, map = new WeakMap()) => {
  // 判断是否是基本类型，这里是有问题的，这样拷贝的函数是空的匿名函数
  // if (Object(source) !== source && typeof source === 'function') {
  //     return source
  // }
  //  应该是，判断是否是基本类型或者是函数
  // if (Object(source) !== source || typeof source === 'function') {
  //   return source
  // }
  // 又或者只判断基本类型
  if (Object(source) !== source) {
    return source
  }

  // 检查循环引用
  if (map.has(source)) {
    return map.get(source)
  }

  let result
  // 检查是否是数组
  if (Array.isArray(source)) {
    result = []
    map.set(source, result)
    source.forEach((i) => result.push(deepClone(i, map)))
    return result
  } else {
    const Constructor = source.constructor
    switch (Constructor) {
      case Boolean:
      case Date:
      case Number:
      case String:
      case RegExp: {
        // return new Constructor(source)
        return source
      }
      default:
        result = new Constructor()
        map.set(source, result)
    }
    const keys = [
      ...Object.getOwnPropertyNames(source),
      ...Object.getOwnPropertySymbols(source)
    ]
    keys.forEach((k) => {
      result[k] = deepClone(source[k], map)
    })
  }
  return result
}

const a = { a: { a: 'a' }, b: 'b' }

const b = deepClone(a)

a.a.a = 'aaa'

const c = [1, 2, [3, [4]]]

const d = deepClone(c)

c[2] = 'aaa'

console.log(a, b) // { a: { a: 'aaa' }, b: 'b' } { a: { a: 'a' }, b: 'b' }

console.log(c, d) // [ 1, 2, 'aaa' ] [ 1, 2, [ 3, [ 4 ] ] ]
