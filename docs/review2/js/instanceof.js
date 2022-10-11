function myInstanceof(a, b) {
  // 基本类型返回 false
  if (typeof a !== 'object') {
    return false
  }
  if (!a.__proto__) {
    return false
  }
  if (a.__proto__ === b.prototype) {
    return true
  } else {
    return myInstanceof(a.__proto__, b)
  }
}

function myInstanceof2(a, b) {
  if (typeof a !== 'object') {
    return false
  }

  while (true) {
    // 原型链到尽头了
    if (!a) {
      return false
    }
    if (a === b.prototype) {
      return true
    }
    a = a.__proto__
  }
}

const a = ''
console.log(myInstanceof2(a, String))
console.log(myInstanceof2(a, Boolean))
