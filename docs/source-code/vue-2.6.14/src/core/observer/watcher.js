/* @flow */

import {
  warn,
  remove,
  isObject,
  parsePath,
  _Set as Set,
  handleError,
  invokeWithErrorHandling,
  noop
} from '../util/index'

import { traverse } from './traverse'
import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

import type { SimpleSet } from '../util/index'

let uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 */
export default class Watcher {
  vm: Component;
  expression: string;
  cb: Function;
  id: number;
  deep: boolean;
  user: boolean;
  lazy: boolean;
  sync: boolean;
  dirty: boolean;
  active: boolean;
  deps: Array<Dep>;
  newDeps: Array<Dep>;
  depIds: SimpleSet;
  newDepIds: SimpleSet;
  before: ?Function;
  getter: Function;
  value: any;

  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: ?Object,
    isRenderWatcher?: boolean
  ) {
    // 将 vm 绑定在当前 watcher 实例的 vm 属性上
    this.vm = vm
    // 如果是渲染watcher 的话
    if (isRenderWatcher) {
      // 将当前 watcher 实例绑定在 vm 的 _watcher 属性上
      vm._watcher = this
    }
    vm._watchers.push(this)
    // options
    if (options) {
      this.deep = !!options.deep
      // user watcher 时 为 true
      this.user = !!options.user
      // lazy 延迟执行的标志
      // 计算watcher 时就会传入 true 了
      this.lazy = !!options.lazy
      // watcher 默认是异步执行的(nextTick) 。在 queueWatcher 会进行去重处理。
      // 当在一个 dom 更新周期内时，nextTick 只会执行一次
      // 如果要多次执行就可以在 user watcher 中设置 sync = true 强制更新执行，比较耗性能
      // https://forum.vuejs.org/t/synchronize-watch/4848/2
      this.sync = !!options.sync
      // 除了 before，上面的4个属性都与渲染watcher无关
      // 渲染watcher 传入的 options 会携带 before方法，用于调用 beforeUpdate 生命周期钩子
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    // 计算watcher 传递的cb是 noop(内定的空函数)
    // 渲染watcher 传递的cb是 noop(内定的空函数)
    // user watcher 传递的cb是 用户定义的回调
    this.cb = cb
    // 实例 id 自增计数，每创建一个 dep 就会自增，由于是先自增后赋值，所以 watcher 的id 初始为1
    this.id = ++uid // uid for batching
    this.active = true
    // dirty 只会在 计算watcher 初始化时，watcher.update 执行时，变为true
    // watcher.evaluate() 执行完就变为 false
    this.dirty = this.lazy // for lazy watchers
    // ------------ 记录 dep ----------------
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()
    // ------------ 记录 dep ----------------
    this.expression = process.env.NODE_ENV !== 'production'
      ? expOrFn.toString()
      : ''
    // parse expression for getter
    if (typeof expOrFn === 'function') {
      // 渲染watcher 会给这个参数传递函数 -> updateComponent, _update的容器
      // 计算watcher 会给这个参数传递函数 -> getter
      this.getter = expOrFn
    } else {
      // user watcher 是支持传入函数的
      // 如果是选项定义方式的 user watcher expOrFn 一般都是字符串
      // 如果是 vm.$watcher 形式的 user watcher expOrFn 是可以定义函数的
      // 不过一般来说最常用的还是字符串形式
      // 所以 user watcher 基本上都会走到这里
      // user watcher -> 一个返回监听 data 的函数
      this.getter = parsePath(expOrFn)
      // 如果 this.getter 不存在，则报警
      if (!this.getter) {
        this.getter = noop
        process.env.NODE_ENV !== 'production' && warn(
          `Failed watching path: "${expOrFn}" ` +
          'Watcher only accepts simple dot-delimited paths. ' +
          'For full control, use a function instead.',
          vm
        )
      }
    }
    // 判断是否延时执行
    // 延时：this.lazy === true watcher实例的 value = undefined
    // 不延时： this.lazy === false watcher实例的 value = this.get() 返回值
    this.value = this.lazy
      ? undefined
      : this.get()
  }

  /**
   * Evaluate the getter, and re-collect dependencies.
   */
  get () {
    // 把当前的 watcher 对象推入栈 并将 Dep.target 设置成当前的 watcher
    // 这就是为什么父子组件，子组件先挂载，父组件后挂载，因为是个栈
    // 计算watcher 执行到 get 时，这里推入的是 计算watcher
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // 调用构造函数中存储的 getter 也就是 expOrFn，以 vm 作为 this 调用
      // 对于 渲染watcher 来说就是调用 updateComponent, 调用 _update -> _render() 获取到新的 data
      // 对于 计算watcher 来说就是调用 getter，也就是用户定义的函数，
      //    在函数中会对 data 进行访问，获取数据，就会触发 data 的依赖收集，收集计算watcher
      // 对于 user watcher 来说就是调用 获取 data 的函数，拿到了 监听的data值。
      //    在函数中会对 data 进行访问，获取数据，就会触发 data 的依赖收集，收集 user watcher
      // 不管是初始化，还是数据更新，数据的获取都是通过调用 getter() 来获取的，
      value = this.getter.call(vm, vm)
    } catch (e) {
      if (this.user) {
        handleError(e, vm, `getter for watcher "${this.expression}"`)
      } else {
        throw e
      }
    } finally {
      // "touch" every property so they are all tracked as
      // dependencies for deep watching
      // 如果是深度监听，则去深度触发 getter 进行依赖收集
      if (this.deep) {
        traverse(value)
      }
      // expOrFn 执行完成后，将栈顶的 watcher 推出
      popTarget()
      // 清除依赖收集
      this.cleanupDeps()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   * 将观察对象与 watcher 建立依赖关系
   */
  addDep (dep: Dep) {
    const id = dep.id
    // 判断当前watcher 是否已经存储了 dep 对象
    if (!this.newDepIds.has(id)) {
      // 当数据更新导致派发更新时，newDeps/newDepIds 在上一次的 watcher.get 调用完就均已清空，
      // 所以会重新收集 dep（这里的 dep 其实还是原来的，dep 是不会清空和重新生成的），
      // 但是 depIds 依旧保持着旧的id，所以这里不会重复添加 watcher，
      // 这里也就是说明，每一次的依赖收集派发更新的过程中，依赖(dep) 是需要实时更新的，总是要拿到新的依赖，
      // 而观察者则不需要变。

      // 如果没有的话就把 dep 存储到当前的watcher 中
      // set存储id
      this.newDepIds.add(id)
      // 数组存储对象
      // watcher 中为什么要存储 dep？
      // 从 渲染watcher 的角度来看，一个 渲染watcher 和一个 组件是一一对应的，
      // 然而一个组件会有多个数据，每一个对象数据就会有一个 dep
      // watcher 需要和多条数据建立关系，所以是多对多
      this.newDeps.push(dep)
      // 如果旧依赖中不包含新依赖的id，则需要将当前 watcher 添加到 依赖的观察者池 中
      // 这样新依赖派发更新也能更新到此 watcher
      if (!this.depIds.has(id)) {
        // 然后把当前watcher 添加到 当前dep的subs 观察者池中
        dep.addSub(this)
      }
    }
  }

  /**
   * Clean up for dependency collection.
   * https://wangtunan.github.io/blog/vueAnalysis/reactive/dep.html#adddep%E5%92%8Ccleanupdeps
   * 比如说通过 v-if v-else 控制显隐的两个组件，切换组件显隐时，不再需要的 dep 就需要被清除，
   * 避免无关的依赖进行组件的重复渲染、watch 回调等。
   */
  cleanupDeps () {
    let i = this.deps.length
    while (i--) {
      const dep = this.deps[i]
      // 如果在新的依赖id中已经没有了，就说明已经不需要了，就把旧的依赖项删除
      if (!this.newDepIds.has(dep.id)) {
        dep.removeSub(this)
      }
    }
    // 将新的依赖赋值给老依赖，清空新依赖
    let tmp = this.depIds
    this.depIds = this.newDepIds
    this.newDepIds = tmp
    this.newDepIds.clear()
    // 将新的依赖赋值给老依赖，清空新依赖
    tmp = this.deps
    this.deps = this.newDeps
    this.newDeps = tmp
    this.newDeps.length = 0
  }

  /**
   * Subscriber interface.
   * Will be called when a dependency changes.
   */
  update () {
    /* istanbul ignore else */
    // 如果是 计算watcher，则将 dirty 赋值为 true。不将其放入 queueWatcher 中
    // 对于 计算属性 来说，watcher.update 执行，和计算属性求值，是两个概念，要区分
    if (this.lazy) {
      this.dirty = true
    // watcher 默认是异步执行的(nextTick) 。在 queueWatcher 会进行去重处理。
    // 当在一个 dom 更新周期内时，nextTick 只会执行一次
    // 如果要多次执行就可以在 user watcher 中设置 sync = true 强制更新执行
    // https://forum.vuejs.org/t/synchronize-watch/4848/2
    } else if (this.sync) {
      this.run()
    } else {
      // user watcher 渲染watcher 走这里
      queueWatcher(this)
    }
  }

  /**
   * Scheduler job interface.
   * Will be called by the scheduler.
   */
  run () {
    // 标记当前 watcher 对象是否是存活状态
    if (this.active) {
      // 调用 watcher 的 get 方法
      // 对于 渲染watcher 来说，是没有返回值的
      // 如果是 user watcher 就会有返回值 user watcher 就是返回监听的 data
      // 计算watcher 不会在 run 中执行，计算watcher 在 watcher.evaluate 中执行
      const value = this.get()
      // 值不相同才会往下继续执行 || 值是一个对象 || user watcher 选项 deep === true
      if (
        value !== this.value ||
        // Deep watchers and watchers on Object/Arrays should fire even
        // when the value is the same, because the value may
        // have mutated.
        isObject(value) ||
        this.deep
      ) {
        // set new value
        // 设置新值
        const oldValue = this.value
        this.value = value
        // 如果是 user watcher 则在 invokeWithErrorHandling 中调用 cb 回调
        if (this.user) {
          const info = `callback for watcher "${this.expression}"`
          // 将新值，旧值传给 cb
          invokeWithErrorHandling(this.cb, this.vm, [value, oldValue], this.vm, info)
        } else {
          // 如果不是 user watcher 则直接执行
          // 问题？？ 这句有啥用？ 渲染watcher 的 cb 是 noop
          this.cb.call(this.vm, value, oldValue)
        }
      }
    }
  }

  /**
   * Evaluate the value of the watcher.
   * 计算 watcher 的值
   * This only gets called for lazy watchers.
   * 只给 lazy watchers 调用，一般来说只有计算watcher 的 lazy 是 true，所以这里也就是只给 计算watcher 调用。
   * 计算watcher 在这里执行 调试
   * render中访问到了 计算watcher，会去调用 core/instance/state.js 中的 computedGetter
   * computedGetter 会调用 watcher.evaluate
   */
  evaluate () {
    this.value = this.get()
    this.dirty = false
  }

  /**
   * Depend on all deps collected by this watcher.
   * 通过当前 watcher 收集所有依赖
   * 只有计算watcher 中会调用该方法，在 computedGetter 中调用
   */
  depend () {
    let i = this.deps.length
    while (i--) {
      this.deps[i].depend()
    }
  }

  /**
   * Remove self from all dependencies' subscriber list.
   * 从所有依赖列表中删除自身
   */
  teardown () {
    if (this.active) {
      // remove self from vm's watcher list
      // this is a somewhat expensive operation so we skip it
      // if the vm is being destroyed.
      if (!this.vm._isBeingDestroyed) {
        remove(this.vm._watchers, this)
      }
      let i = this.deps.length
      while (i--) {
        this.deps[i].removeSub(this)
      }
      this.active = false
    }
  }
}
