// 实现 add(1)(2)(3)  add(1,2,3) == 6
function add(...args1) {
  let totalArgs = args1
  function fn(...args2) {
    totalArgs = args1.concat(args2)
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

// 使用 bind 保存链式调用参数的思路

function add(...params) {
  const fn = add.bind(null, ...params)
  // valueOf()
  fn.toString = () =>
    params.reduce((prev, cur) => {
      prev += cur
      return prev
    }, 0)
  return fn
}

add(1)(2)(3).toString()
