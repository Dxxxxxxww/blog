/* @flow */

import {
  warn,
  invokeWithErrorHandling
} from 'core/util/index'
import {
  cached,
  isUndef,
  isTrue,
  isPlainObject
} from 'shared/util'

const normalizeEvent = cached((name: string): {
  name: string,
  once: boolean,
  capture: boolean,
  passive: boolean,
  handler?: Function,
  params?: Array<any>
} => {
  const passive = name.charAt(0) === '&'
  name = passive ? name.slice(1) : name
  const once = name.charAt(0) === '~' // Prefixed last, checked first
  name = once ? name.slice(1) : name
  const capture = name.charAt(0) === '!'
  name = capture ? name.slice(1) : name
  return {
    name,
    once,
    capture,
    passive
  }
})
// 返回一个 invoker 函数，将事件添加到 invoker.fns 上
// 意味着其后调用的 add 方法的 handler 参数就是 invoker，而不直接是我们传入的 handleClick 方法
// 相当于包裹了一层
export function createFnInvoker (fns: Function | Array<Function>, vm: ?Component): Function {
  function invoker () {
    const fns = invoker.fns
    // 如果有多个监听函数则遍历调用
    if (Array.isArray(fns)) {
      const cloned = fns.slice()
      for (let i = 0; i < cloned.length; i++) {
        // 用 try...catch 包裹执行
        // 如果用户定义了全局的错误捕获方法，就会调用，否则直接使用 console.error 抛出
        invokeWithErrorHandling(cloned[i], null, arguments, vm, `v-on handler`)
      }
    } else {
      // 直接调用监听函数
      // 用 try...catch 包裹执行
      // return handler return value for single handlers
      return invokeWithErrorHandling(fns, null, arguments, vm, `v-on handler`)
    }
  }
  // 把 for-in 循环的当前事件监听赋值到 invoker 方法的 fns 属性上
  invoker.fns = fns
  return invoker
}

export function updateListeners (
  on: Object,
  oldOn: Object,
  add: Function,
  remove: Function,
  createOnceHandler: Function,
  vm: Component
) {
  let name, def, cur, old, event
  // 用来add添加事件监听或者更新事件监听
  for (name in on) {
    def = cur = on[name]
    old = oldOn[name]
    event = normalizeEvent(name)
    /* istanbul ignore if */
    if (__WEEX__ && isPlainObject(def)) {
      cur = def.handler
      event.params = def.params
    }
    // 首先判断了当前事件是否已经定义，如果没有则在开发环境下提示错误信息
    if (isUndef(cur)) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid handler for event "${event.name}": got ` + String(cur),
        vm
      )
    // 如果已经定义，但在旧事件监听中，没有则表示应该使用add来新增这个事件监听
    } else if (isUndef(old)) {
      if (isUndef(cur.fns)) {
        // 返回一个 invoker 函数，将事件添加到 invoker.fns 上
        // 意味着其后调用的 add 方法的 handler 参数就是 invoker，而不直接是我们传入的 handleClick 方法
        // 相当于给我们传入的方法包裹了一层（增加  try...catch ），在事件触发时会去调用 invoker.fns。如果是数组则遍历调用，不是数组直接调用
        cur = on[name] = createFnInvoker(cur, vm)
      }
      if (isTrue(event.once)) {
        cur = on[name] = createOnceHandler(event.name, cur, event.capture)
      }
      // 内部通过 addEventListener 来监听原生事件，在 src/platforms/web/runtime/modules/events.js 中传入
      add(event.name, cur, event.capture, event.passive, event.params)
    // 如果当前事件监听和旧事件监听都有，但是不并相同。则表明虽然监听的是同一个事件，但是回调函数不同，此时应该更新事件
    } else if (cur !== old) {
      old.fns = cur
      on[name] = old
    }
  }
  // 用来移除事件监听
  for (name in oldOn) {
    // 判断旧事件监听不在新事件监听中，则表明应该移除这些事件监听
    if (isUndef(on[name])) {
      event = normalizeEvent(name)
      // 内部通过 removeEventListener 来移除事件，在 src/platforms/web/runtime/modules/events.js 中传入
      remove(event.name, oldOn[name], event.capture)
    }
  }
}
