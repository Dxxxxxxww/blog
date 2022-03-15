/* @flow */
/* globals MutationObserver */

import { noop } from 'shared/util'
import { handleError } from './error'
import { isIE, isIOS, isNative } from './env'

export let isUsingMicroTask = false

// 存储所有回调函数的数组
const callbacks = []
// 回调数组是否正在被处理的标志
let pending = false

function flushCallbacks () {
  // 异步执行时，重置状态
  // 这里先重置状态，再执行。也不会导致进入 nextTick 中 pending 为 false 执行 timerFunc() 的分支
  // 因为当 flushCallbacks() 异步执行时，主程序栈已经执行完了。要注意这是异步！
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}
// 完全使用微任务也有一个问题，浏览器中微任务的执行时在更新渲染之前的。
// 如果我们使用 $nextTick 想要获取 dom，并且这个 nextTick 在 dom 更新前执行的话，我们就不能获取到更新之后的dom
// Here we have async deferring wrappers using microtasks.
// 这里我们使用微任务的异步延迟包装器
// In 2.5 we used (macro) tasks (in combination with microtasks).
// 在 2.5版本中，我们使用 宏任务结合微任务
// However, it has subtle problems when state is changed right before repaint
// 但是，在重绘之前改变状态会有一些微妙的问题
// (e.g. #6813, out-in transitions).
// Also, using (macro) tasks in event handler would cause some weird behaviors
// 并且，在事件处理程序中使用(宏)任务会导致一些不可避免的怪异行为。
// 例如：当使用宏任务时，在用户持续滚动的情况下，nextTick 任务被延后了很久才去执行，导致动画跟不上滚动了。
// that cannot be circumvented (e.g. #7109, #7153, #7546, #7834, #8109).
// So we now use microtasks everywhere, again.
// 所以现在我们到处都在使用微任务
// A major drawback(缺点) of this tradeoff(权衡) is that there are some scenarios(情景)
// where microtasks have too high a priority and fire in between supposedly(据说，据传)
// sequential(连续的) events (e.g. #4521, #6690, which have workarounds)
// or even between bubbling of the same event (#6566).
// 这种权衡的一个主要缺点是，在某些情况下，微任务的优先级过高，
// 并且在假定的顺序事件之间触发，甚至在同一事件的冒泡之间触发
let timerFunc

// The nextTick behavior leverages the microtask queue, which can be accessed
// via either native Promise.then or MutationObserver.
// nextTick行为利用了微任务队列，它可以通过任何一个本地Promise访问。或者使用 MutationObserver
// MutationObserver has wider support, however it is seriously bugged in
// UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
// MutationObserver有更广泛的支持，但是它在iOS的UIWebView中，在iOS >= 9.3.3，在触摸事件处理程序中触发时，有严重的bug。
// completely stops working after triggering a few times... so, if native
// 它会在触发几次后完全停止工作。因此，如果 promise 可以，将优先使用 promise。
// Promise is available, we will use it:
/* istanbul ignore next, $flow-disable-line */
// 异步降级过程
// 微任务形式优先-------------------------
// 使用 promise
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    // In problematic UIWebViews, Promise.then doesn't completely break, but
    // 在有问题的UIWebViews中, Promise.then 不会完全中断,
    // it can get stuck in a weird state where callbacks are pushed into the
    // 但它可能会陷入一种奇怪的状态,回调被推入微任务队列
    // microtask queue but the queue isn't being flushed, until the browser
    // 但队列不会被刷新,
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // 直到浏览器需要做一些其他工作,例如处理一个计时器。
    // "force" the microtask queue to be flushed by adding an empty timer.
    // 因此，我们可以通过添加一个空计时器来“强制”刷新微任务队列。
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
// 使用 MutationObserver
// 不兼容 ie
} else if (!isIE && typeof MutationObserver !== 'undefined' && (
  isNative(MutationObserver) ||
  // PhantomJS and iOS 7.x
  MutationObserver.toString() === '[object MutationObserverConstructor]'
)) {
  // Use MutationObserver where native Promise is not available,
  // e.g. PhantomJS, iOS7, Android 4.4
  // 在原生Promise不可用的地方使用MutationObserver，例如PhantomJS, iOS7, Android 4.4，ie10，ie9
  // (#6466 MutationObserver is unreliable in IE11)
  // MutationObserver 在 IE11 中 也是不可靠的
  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
// 下面是宏任务--------------------------
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  // setImmediate 只存在于高版本IE浏览器和低版本Edge浏览器中，其它浏览器不支持
  // setImmediate 性能比 setTimeout 好。
  // setTimeout 设置 0 时也会延迟 4ms 才执行。
  // Fallback to setImmediate.
  // 微任务不支持的话，就退回使用 setImmediate
  // Technically it leverages(影响力，手段；杠杆力，杠杆作用) the (macro) task queue,
  // 从技术上讲，它利用了(宏)任务队列
  // but it is still a better choice than setTimeout.
  // 但它仍然是比setTimeout更好的选择
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  // Fallback to setTimeout.
  // 只能使用 setTimeout 了
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// 在下次 DOM 更新循环结束之后执行延迟回调。
// 在修改数据之后立即使用这个方法，获取更新后的 DOM。
export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  // 用 try...catch 包裹用户传入的函数，再 push 到 回调数组中
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    //  如果支持 promise 则使用 promise
    //  _resolve 就是个 闭包变量
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    // 将回调正在被处理的标志置为 true
    pending = true
    // 调用回调数组中的函数
    timerFunc()
  }
  // $flow-disable-line
  // 如果没有传入回调函数，并且环境支持 promise 则返回一个promise
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
