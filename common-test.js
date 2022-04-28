// 实现 add(1)(2)(3)  add(1,2,3) == 6
// 第一种
function add(...args1) {
  let totalArgs = args1
  function fn(...args2) {
    totalArgs = totalArgs.concat(args2)
    return fn
  }
  fn.valueOf = () => {
    return totalArgs.reduce((total, cur) => {
      return total + cur
    }, 0)
  }
  return fn
}

add(1)(2)(3).valueOf()

// 第二种，利用 bind 特性
function add() {
  const args = [...arguments]
  const fn = add.bind(this, ...args)
  fn.valueOf = () => {
    return args.reduce((total, cur) => {
      return total + cur
    }, 0)
  }
  return fn
}

// 实现一个公共的科里化函数，将普通函数转变成科里化函数
// add(1,2,3) == 6  const arr2 = curry(add)  add2(1)(2)(3)

function curry(func) {
  const argLength = func.length
  const args = Array.prototype.slice.call(arguments, 1)
  return function fn() {
    args.push(...arguments)
    if (args.length < argLength) {
      return fn
    }
    return func(...args)
  }
}

function add1(x, y, z) {
  return x + y + z
}

const add2 = curry(add1)
console.log(add2(1)(2)(3))
