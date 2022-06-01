// 防抖 (debounce): 将多次高频操作优化为只在最后一次执行，通常使用的场景是：用户输入，只需再输入完成后做一次输入校验即可。

function debounce(fn, wait, immediate) {
  let timeId = null
  return function (...args) {
    const context = this

    if (immediate && !timeId) {
      fn.apply(context, args)
    }

    if (timeId) {
      clearTimeout(timeId)
    }

    timeId = setTimeout(() => {
      fn.apply(context, args)
    }, wait)
  }
}

// 节流(throttle): 每隔一段时间后执行一次，也就是降低频率，将高频操作优化成低频操作，通常使用场景: 滚动条事件 或者 resize 事件，通常每隔 100~500 ms执行一次即可。

function throttle(fn, wait, immediate) {
  let timeId = null
  let callNow = immediate
  return function (...args) {
    const context = this

    if (callNow) {
      fn.apply(context, args)
      // 立即执行完之后需要清除，否则会在接下来的节流过程中重复执行
      callNow = false
    }

    if (timeId) {
      return
    }

    timeId = setTimeout(() => {
      fn.apply(context, args)
      clearTimeout(timeId)
      timeId = null
    }, wait)
  }
}
