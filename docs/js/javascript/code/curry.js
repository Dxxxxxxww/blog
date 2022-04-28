// 实现 add(1)(2)(3)  add(1,2,3) == 6
function add(...args1) {
  let totalArgs = args1
  function fn(...args2) {
    totalArgs = args1.concat(args2)
  }
  fn.valueOf = () => {
    return totalArgs.reduce((total, cur) => {
      return total + cur
    }, 0)
  }
  return fn
}

add(1)(2)(3).valueOf()
