/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  formatComponentName,
  invokeWithErrorHandling
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'

export function initEvents (vm: Component) {
  // 初始化事件中心
  vm._events = Object.create(null)
  vm._hasHookEvent = false
  // init parent attached events
  // 获取父级中添加的事件
  const listeners = vm.$options._parentListeners
  if (listeners) {
    // 监听父级上添加的事件
    updateComponentListeners(vm, listeners)
  }
}

let target: any

function add (event, fn) {
  target.$on(event, fn)
}

function remove (event, fn) {
  target.$off(event, fn)
}

function createOnceHandler (event, fn) {
  const _target = target
  return function onceHandler () {
    const res = fn.apply(null, arguments)
    if (res !== null) {
      _target.$off(event, onceHandler)
    }
  }
}

export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  updateListeners(listeners, oldListeners || {}, add, remove, createOnceHandler, vm)
  target = undefined
}

export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  // 可以传入事件数组，为多个事件绑定相同的事件处理函数
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    // 传入的是数组
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        vm.$on(event[i], fn)
      }
    } else {
      // 将事件处理函数存储到事件中心
      // initEvents() 在 _init() 中调用，会初始化 _events
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // 通过在注册时使用一个布尔标志来优化 hook:event 开销
      // instead of a hash lookup
      // 代替 hash 查找
      // 判断是否有监听生命周期钩子函数
      // this.$on('hook:destroyed', () => {
      //   window.removeEventListener('resize', listenResize)
      // })
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }

  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    // 将事件处理函数包裹一层
    function on () {
      // 先移除注册的事件
      vm.$off(event, on)
      // 执行事件处理函数
      fn.apply(vm, arguments)
    }
    // 包裹函数上添加静态属性，值是真正的事件处理函数
    on.fn = fn
    // 注册包裹后的事件处理函数
    vm.$on(event, on)
    return vm
  }
  // 可以传入事件数组，为多个事件解绑相同的事件处理函数
  // 即便对应事件已经删除完所有的事件处理函数，事件列表为空数组(vm._events[event] === [])，$off 也不会将其清空
  // 除非不传时间处理函数，这样就会进入清空逻辑分支
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all
    // 如果没有传入任何参数，则初始化事件中心，相当于解绑所有事件
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }
    // array of events
    // 如果是多个事件解绑同一个事件处理函数
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        // 遍历递归调用 $off
        vm.$off(event[i], fn)
      }
      return vm
    }
    // specific event 明确事件，单一事件
    // 取出事件处理函数数组
    const cbs = vm._events[event]
    // 如果是没有监听的事件，静默失败直接返回
    if (!cbs) {
      return vm
    }
    // 只传了事件，没有传递事件处理函数，直接移除该事件监听
    if (!fn) {
      vm._events[event] = null
      return vm
    }
    // specific handler
    // event和fn都传递了
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      // 如果事件中心的事件处理函数与传入的事件处理函数相同，则删除
      // $on 注册事件 , $once 注册事件
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    if (process.env.NODE_ENV !== 'production') {
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }
    // 从事件中心取出事件处理函数数组
    let cbs = vm._events[event]
    // 如果有对应的函数
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      const args = toArray(arguments, 1)
      const info = `event handler for "${event}"`
      for (let i = 0, l = cbs.length; i < l; i++) {
        // 使用 try…catch 包裹来安全执行函数，出错时执行 Vue 的 handleError()方法
        invokeWithErrorHandling(cbs[i], vm, args, vm, info)
      }
    }
    return vm
  }
}
