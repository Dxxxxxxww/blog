// 防抖 (debounce): 将多次高频操作优化为只在最后一次执行，通常使用的场景是：用户输入，只需再输入完成后做一次输入校验即可。
function debounce(fn, time, immediate) {
  let timer
  return function (...args) {
    const ctx = this
    if (immediate) {
      fn.apply(ctx, args)
      // 需要置为 false 否则之后每次都会立即执行
      immediate = false
    }
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.apply(ctx, args)
    }, time)
  }
}
// 节流(throttle): 每隔一段时间后执行一次，也就是降低频率，将高频操作优化成低频操作，通常使用场景: 滚动条事件 或者 resize 事件，通常每隔 100~500 ms执行一次即可。

function throttle(fn, time, immediate) {
  let timer
  return function (...args) {
    const ctx = this
    if (immediate) {
      fn.apply(ctx, args)
      // 需要置为 false 否则之后每次都会立即执行
      immediate = false
    }
    if (timer) {
      return
    }
    timer = setTimeout(() => {
      fn.apply(ctx, args)
      clearTimeout(timer)
      timer = null
    }, time)
  }
}
