/* @flow */

import type Watcher from './watcher'
import config from '../config'
import { callHook, activateChildComponent } from '../instance/lifecycle'

import {
  warn,
  nextTick,
  devtools,
  inBrowser,
  isIE
} from '../util/index'

export const MAX_UPDATE_COUNT = 100

const queue: Array<Watcher> = []
const activatedChildren: Array<Component> = []
let has: { [key: number]: ?true } = {}
let circular: { [key: number]: number } = {}
let waiting = false
// 表示正在刷新
let flushing = false
let index = 0

/**
 * Reset the scheduler's state.
 * 重置 scheduler 的状态
 */
function resetSchedulerState () {
  index = queue.length = activatedChildren.length = 0
  has = {}
  if (process.env.NODE_ENV !== 'production') {
    circular = {}
  }
  waiting = flushing = false
}

// Async edge case #6566 requires saving the timestamp when event listeners are
// attached. However, calling performance.now() has a perf overhead especially
// if the page has thousands of event listeners. Instead, we take a timestamp
// every time the scheduler flushes and use that for all event listeners
// attached during that flush.
export let currentFlushTimestamp = 0

// Async edge case fix requires storing an event listener's attach timestamp.
let getNow: () => number = Date.now

// Determine what event timestamp the browser is using. Annoyingly, the
// timestamp can either be hi-res (relative to page load) or low-res
// (relative to UNIX epoch), so in order to compare time we have to use the
// same timestamp type when saving the flush timestamp.
// All IE versions use low-res event timestamps, and have problematic clock
// implementations (#9632)
if (inBrowser && !isIE) {
  const performance = window.performance
  if (
    performance &&
    typeof performance.now === 'function' &&
    getNow() > document.createEvent('Event').timeStamp
  ) {
    // if the event timestamp, although evaluated AFTER the Date.now(), is
    // smaller than it, it means the event is using a hi-res timestamp,
    // and we need to use the hi-res version for event listener timestamps as
    // well.
    getNow = () => performance.now()
  }
}

/**
 * Flush both queues and run the watchers.
 * 刷新所有队列并执行 watchers
 */
function flushSchedulerQueue () {
  currentFlushTimestamp = getNow()
  // 标记当前正在刷新 queue
  flushing = true
  let watcher, id

  // Sort queue before flush.
  // 在 刷新 前先按从小到大排序
  // This ensures that:
  // 这将确保
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child)
  // 组件的更新顺序是从父组件到子组件。(因为父组件总是在子组件之前创建)
  // 2. A component's user watchers are run before its render watcher (because
  //    user watchers are created before the render watcher)
  // 组件的 user watchers 在 渲染watcher 之前运行(因为 user watchers 在 渲染watcher 之前创建)
  // 3. If a component is destroyed during a parent component's watcher run,
  //    its watchers can be skipped.
  // 如果一个组件在父组件的 watcher 运行期间被销毁，它的 watcher 可以被跳过
  queue.sort((a, b) => a.id - b.id)

  // do not cache length because more watchers might be pushed
  // 不要缓存 length，也就是 length 不提前到跟 index = 0 同一个 ；中初始化
  // 这是因为在执行时，可能会继续往 queue 中添加 watcher
  // as we run existing watchers
  for (index = 0; index < queue.length; index++) {
    // 获取当前 watcher
    watcher = queue[index]
    // 判断是否有 beforeUpdate 生命周期钩子要执行
    // 只有 渲染watcher 会有这个
    if (watcher.before) {
      watcher.before()
    }
    id = watcher.id
    // 将 watcher 处理标志置位 null ，因为当前 watcher 已经要被执行了
    // 这里置位 null 是为了下次数据有更新是 watcher 能正常被运行
    has[id] = null
    // 执行 watcher
    watcher.run()
    // in dev build, check and stop circular updates.
    if (process.env.NODE_ENV !== 'production' && has[id] != null) {
      circular[id] = (circular[id] || 0) + 1
      if (circular[id] > MAX_UPDATE_COUNT) {
        warn(
          'You may have an infinite update loop ' + (
            watcher.user
              ? `in watcher with expression "${watcher.expression}"`
              : `in a component render function.`
          ),
          watcher.vm
        )
        break
      }
    }
  }

  // keep copies of post queues before resetting state
  // 重置状态前，先保存队列副本
  const activatedQueue = activatedChildren.slice()
  const updatedQueue = queue.slice()
  // 重置 scheduler 的状态
  resetSchedulerState()

  // call component updated and activated hooks
  // 调用组件 updated 和 activated 生命周期钩子
  callActivatedHooks(activatedQueue)
  callUpdatedHooks(updatedQueue)

  // devtool hook
  /* istanbul ignore if */
  if (devtools && config.devtools) {
    devtools.emit('flush')
  }
}

function callUpdatedHooks (queue) {
  let i = queue.length
  while (i--) {
    const watcher = queue[i]
    const vm = watcher.vm
    if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
      callHook(vm, 'updated')
    }
  }
}

/**
 * Queue a kept-alive component that was activated during patch.
 * The queue will be processed after the entire tree has been patched.
 */
export function queueActivatedComponent (vm: Component) {
  // setting _inactive to false here so that a render function can
  // rely on checking whether it's in an inactive tree (e.g. router-view)
  vm._inactive = false
  activatedChildren.push(vm)
}

function callActivatedHooks (queue) {
  for (let i = 0; i < queue.length; i++) {
    queue[i]._inactive = true
    activateChildComponent(queue[i], true /* true */)
  }
}

/**
 * Push a watcher into the watcher queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 * 将一个观察者推入观察者队列。
 * 具有重复id的任务将被跳过，除非它是
 * 在队列被刷新时推送。
 */
export function queueWatcher (watcher: Watcher) {
  const id = watcher.id
  // 避免 watcher 被重复处理
  // 如果 has 中没有对应 id 则执行
  if (has[id] == null) {
    // 标记当前 watcher 被处理
    has[id] = true
    // flushing 表示正在刷新
    // 如果当前队列没有在被处理
    if (!flushing) {
      // 则将当前的watcher 推入队尾
      queue.push(watcher)
    } else {
      // if already flushing, splice the watcher based on its id
      // 如果已经在刷新了，则根据 watcher 的id 进行 splice
      // if already past its id, it will be run next immediately.
      // 如果已经超过了当前 watcher 的id，它将立即下一个运行。
      // 获取队列最后一位的index
      let i = queue.length - 1
      // queue 在 flushSchedulerQueue() 中按从小到大排序
      // index 表示当前被处理的 watcher 在 queue 中的 index
      // 如果 i > index 说明，当前队列还没被处理完
      // 如果 i 对应位置的 watcher id 大于 被处理的 watcher id 则将 i 左移
      // 直到找到 id 小于 的位置(不会有重复的id，因为已经进行 id 重复判断了)
      while (i > index && queue[i].id > watcher.id) {
        i--
      }
      // 在 id 相同的位置后移一位，就获得了合适插入的位置
      queue.splice(i + 1, 0, watcher)
    }
    // queue the flush
    // 判断当前队列是否在被执行，false 表示没有被执行
    if (!waiting) {
      waiting = true

      if (process.env.NODE_ENV !== 'production' && !config.async) {
        // 开发环境直接调用
        flushSchedulerQueue()
        return
      }
      nextTick(flushSchedulerQueue)
    }
  }
}
