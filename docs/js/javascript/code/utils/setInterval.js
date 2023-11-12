function myInterval(cb, interval = 1000) {
  let timer, isClear
  const fn = () => {
    if (isClear) {
      clearTimeout(timer)
      timer = null
      isClear = false
      return
    }
    fn()
    timer = setTimeout(cb, interval)
  }
  timer = setTimeout(cb, interval)
  return () => {
    isClear = true
  }
}
