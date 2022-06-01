const requestAnimationFrame =
  window.requestAnimationFrame ||
  function (callback) {
    window.setTimeout(callback, 1000 / 60)
  }

let st = Date.now()
let tt
let fps = 0
let frame = 0

const calcFps = () => {
  const loop = () => {
    tt = Date.now()
    if (tt > st + 1000) {
      fps = Math.round((frame * 1000) / (tt - st))
      console.log(fps)
      st = Date.now()
      frame = 0
    }
    frame++
    requestAnimationFrame(loop)
  }
  loop()
}

function useRaf(callback, options) {
  const { immediate = true } = options
  let rafId = null
  let isActive = null

  function loop() {
    callback()
    rafId = window.requestAnimationFrame(loop)
  }

  function resume() {
    if (!isActive) {
      isActive = true
      loop()
    }
  }

  function pause() {
    isActive = false
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId)
      rafId = null
    }
  }

  if (immediate) {
    resume()
  }

  return {
    resume,
    pause
  }
}

function useFps(options) {
  // every 执行次数，用来算平均值的
  const every = options?.every ?? 10
  let fps = 0
  let ticks = 0
  let last = performance.now()

  useRaf(() => {
    ticks++
    // 达到执行次数，
    if (ticks >= every) {
      const now = performance.now()
      const diff = now - last
      console.log(diff)
      // 一秒内这个页面能完全加载多少次 ->
      // 1秒内，执行一帧花了多长时间，1 / 每次时长，就得到了次数，也就是帧率
      // 计算执行一次的平均时间，
      fps = Math.round(1000 / (diff / ticks))
      console.log(fps)
      last = now
      ticks = 0
    }
  })
  return fps
}
