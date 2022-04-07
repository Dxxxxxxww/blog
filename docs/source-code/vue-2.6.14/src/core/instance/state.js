/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import Dep, { pushTarget, popTarget } from '../observer/dep'
import { isUpdatingChildComponent } from './lifecycle'

import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  hyphenate,
  isReserved,
  handleError,
  nativeWatch,
  validateProp,
  isPlainObject,
  isServerRendering,
  isReservedAttribute,
  invokeWithErrorHandling
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}

export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

export function initState (vm: Component) {
  vm._watchers = []
  const opts = vm.$options
  // 初始化 props
  if (opts.props) initProps(vm, opts.props)
  // 初始化 methods
  // 会判断属性在 props 中是否已经存在
  // 命名不能以 _ $ 开头，否则会报警
  if (opts.methods) initMethods(vm, opts.methods)
  // 初始化 data
  // 会判断数据是否在 props/methods 中存在
  // 命名不能以 _ $ 开头，否则不会代理到 vm 上
  if (opts.data) {
    initData(vm)
  } else {
    // 如果没有传入 data 则响应式生成一个 _data
    observe(vm._data = {}, true /* asRootData */)
  }
  // 初始化 computed
  // 命名 不能与 data/props/methods 重名
  if (opts.computed) initComputed(vm, opts.computed)
  // 初始化 watch
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}

function initProps (vm: Component, propsOptions: Object) {
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // cache prop keys so that future props updates can iterate using Array
  // 缓存 props keys 以便以后的 prop 更新可以使用 Array 进行迭代
  // instead of dynamic object key enumeration.
  // 代替动态对象键枚举
  const keys = vm.$options._propKeys = []
  const isRoot = !vm.$parent
  // root instance props should be converted
  if (!isRoot) {
    toggleObserving(false)
  }
  // 遍历传入的 props 对象
  for (const key in propsOptions) {
    keys.push(key);
    // props 校验 求值
    const value = validateProp(key, propsOptions, propsData, vm);
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== "production") {
      const hyphenatedKey = hyphenate(key);
      if (
        isReservedAttribute(hyphenatedKey) ||
        config.isReservedAttr(hyphenatedKey)
      ) {
        warn(
          `"${hyphenatedKey}" is a reserved attribute and cannot be used as component prop.`,
          vm
        );
      }
      defineReactive(props, key, value, () => {
        if (!isRoot && !isUpdatingChildComponent) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
              `overwritten whenever the parent component re-renders. ` +
              `Instead, use a data or computed property based on the prop's ` +
              `value. Prop being mutated: "${key}"`,
            vm
          );
        }
      });
    } else {
      // 响应式处理
      defineReactive(props, key, value);
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    // 将 props 代理到 vm 实例上
    if (!(key in vm)) {
      proxy(vm, `_props`, key);
    }
  }
  toggleObserving(true)
}

function initData (vm: Component) {
  let data = vm.$options.data
  // 获取 data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  // 获取 data 中所有属性
  const keys = Object.keys(data)
  // 获取 props
  const props = vm.$options.props
  // 获取 methods
  const methods = vm.$options.methods
  let i = keys.length
  // 判断 data 与 methods/props 是否有重名，有则报警
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) {
      // data 属性不能以 _ $ 开头，如果是以 _ $ 开头则不会代理到 vm 上
      proxy(vm, `_data`, key)
    }
  }
  // observe data 响应式处理
  // asRootData 是否是根数据
  observe(data, true /* asRootData */)
}
// data 是函数形式的话，在 try...catch 中运行 data.call(vm, vm) 来获取 data
export function getData (data: Function, vm: Component): any {
  // #7573 disable dep collection when invoking data getters
  // 在调用数据getter时禁用dep收集，所以这里不传参数，让 Dep.target = undefined 让 watcher 栈顶传入 undefined 达到不触发依赖收集的目的
  pushTarget()
  try {
    return data.call(vm, vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  } finally {
    popTarget()
  }
}

const computedWatcherOptions = { lazy: true }

function initComputed (vm: Component, computed: Object) {
  // $flow-disable-line
  // 初始化对象，用于保存计算watcher
  const watchers = vm._computedWatchers = Object.create(null)
  // computed properties are just getters during SSR
  // 在 SSR 上 计算属性只能是 getter
  const isSSR = isServerRendering()

  for (const key in computed) {
    // 获取用户定义的 函数/对象
    const userDef = computed[key]
    // 获取计算属性的 getter ，如果是对象的话就取 get
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    // 开发模式下判断 getter 是否为空，空的话报警
    if (process.env.NODE_ENV !== 'production' && getter == null) {
      warn(
        `Getter is missing for computed property "${key}".`,
        vm
      )
    }
    // 非 SSR 下只传递 compute 属性的 getter
    // 如果是携带 setter 的 computed 也只会给计算watcher 传递 getter
    if (!isSSR) {
      // create internal watcher for the computed property.
      watchers[key] = new Watcher(
        vm,
        getter || noop,
        noop,
        computedWatcherOptions
      )
    }

    // component-defined computed properties are already defined on the component prototype.
    // 组件定义的计算属性已经在组件原型上定义
    // We only need to define computed properties defined at instantiation here.
    // 我们只需要定义在实例化时定义的计算属性。
    // 格式化 computed，将 computed 设置到 vm 上
    if (!(key in vm)) {
      // computed.setter 会在这里进行代理，代理到 vm 实例上
      // template 中使用 computed 时，就会从这里获取
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      // 判断 computed 不能与 data/props/methods 重名
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      } else if (vm.$options.methods && key in vm.$options.methods) {
        warn(`The computed property "${key}" is already defined as a method.`, vm)
      }
    }
  }
}
// 格式化 computed，将 computed 设置到 vm 上
// template 中使用 computed 时，就会从这里的 getter 获取
export function defineComputed (
  // vm
  target: any,
  // 计算watcher的名字，也就是 computed 中用户定义的key
  key: string,
  // 用户定义的计算属性 函数/对象
  userDef: Object | Function
) {
  const shouldCache = !isServerRendering()
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = shouldCache
      // template/js 中使用 computed 时，就会从这里获取
      ? createComputedGetter(key)
      : createGetterInvoker(userDef)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? shouldCache && userDef.cache !== false
        // template/js 中使用 computed 时，就会从这里获取
        ? createComputedGetter(key)
        : createGetterInvoker(userDef.get)
      : noop
    sharedPropertyDefinition.set = userDef.set || noop
  }
  if (process.env.NODE_ENV !== 'production' &&
      sharedPropertyDefinition.set === noop) {
    sharedPropertyDefinition.set = function () {
      warn(
        `Computed property "${key}" was assigned to but it has no setter.`,
        this
      )
    }
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}
// template/js 中使用 computed 时，就会从这里的返回值函数获取
function createComputedGetter (key) {
  // template/js 中使用 computed 时，就会从这里获取
  return function computedGetter () {
    // 从 vm 实例的 计算watcher 集合中获取到对应的 计算watcher
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      // dirty 只会在 计算watcher 初始化时，数据更改派发更新 watcher.update 执行时，变为true
      // watcher.evaluate() 执行完就变为 false
      if (watcher.dirty) {
        // 通过 evaluate 计算获取 computed 的值
        // 内部调用 getter，也就是用户定义的函数，在函数中会对 data 进行访问，就会触发 data 的依赖收集，收集计算watcher
        watcher.evaluate()
      }
      // watcher.evaluate() 执行完后，计算watcher就会pop()，此时栈顶是 渲染watcher === Dep.target
      if (Dep.target) {
        // 定义了计算属性后，并在 template 中使用的场景
        // 计算watcher 调用 depend，遍历 计算watcher 上的所有 dep（访问的 data数据 生成的依赖），使 dep 与 渲染watcher 进行依赖收集
        // 当然如果计算属性没有在 template 中使用，则此时 Dep.target === undefined，则不会进行依赖收集
        watcher.depend()
      }
      // 返回 计算watcher 的值
      // 因为 watcher.update 中，计算watcher 会将 dirty 置为 true。
      // 所以等到 渲染watcher 执行 getter 时，render 中访问到了 计算属性，从而访问到了本函数(computedGetter)，
      // 通过在本函数中使用 计算watcher 执行 evaluate 获取到了更新后的数据，
      // 这样，在 render 中就能获取到计算属性的值了
      return watcher.value
    }
  }
}

function createGetterInvoker(fn) {
  return function computedGetter () {
    return fn.call(this, this)
  }
}

function initMethods (vm: Component, methods: Object) {
  // 初始化 methods 前先获取 props
  const props = vm.$options.props
  // 遍历 methods
  for (const key in methods) {
    if (process.env.NODE_ENV !== 'production') {
      // 开发环境下判断对应的值是否是函数，不是则报警
      if (typeof methods[key] !== 'function') {
        warn(
          `Method "${key}" has type "${typeof methods[key]}" in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      // 开发环境下判断 methods 是否与 props 重名，重名则报警
      if (props && hasOwn(props, key)) {
        warn(
          `Method "${key}" has already been defined as a prop.`,
          vm
        )
      }
      // 判断键在实例上是否已经存在并且是以私有方式命名，如果是则报警
      // 防止覆盖 vue 私有属性
      if ((key in vm) && isReserved(key)) {
        warn(
          `Method "${key}" conflicts with an existing Vue instance method. ` +
          `Avoid defining component methods that start with _ or $.`
        )
      }
    }
    // 把更改 this 指向后的函数挂载到 vm 实例上，函数内部 this 指向 vm
    vm[key] = typeof methods[key] !== 'function' ? noop : bind(methods[key], vm)
  }
}

function initWatch (vm: Component, watch: Object) {
  for (const key in watch) {
    const handler = watch[key]
    // 如果 watch 值是数组的话，则遍历创建。在文档 https://cn.vuejs.org/v2/api/#watch 中有用法介绍
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        createWatcher(vm, key, handler[i])
      }
    } else {
      createWatcher(vm, key, handler)
    }
  }
}
/**
 * 格式化参数，然后调用 $watcher
 * 将对象中的 handler 提取出来，以 cb 为函数形式调用 $watch
 */
function createWatcher (
  vm: Component,
  expOrFn: string | Function,
  handler: any,
  options?: Object
) {
  // 判断是否是对象
  if (isPlainObject(handler)) {
    options = handler
    handler = handler.handler
  }
  // 如果是字符串则去实例上查找对应的函数，也就是 methods 中定义的方法
  if (typeof handler === 'string') {
    handler = vm[handler]
  }
  return vm.$watch(expOrFn, handler, options)
}

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  // 给 data 添加 getter
  const dataDef = {}
  dataDef.get = function () { return this._data }
  // 给 props 添加 getter
  const propsDef = {}
  propsDef.get = function () { return this._props }
  // 开发模式下增加 setter，不允许修改 data，props
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function () {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  // 同 Vue.set 同一个函数挂载
  Vue.prototype.$set = set
  // 同 Vue.delete 同一个函数挂载
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    // 格式化参数
    // 如果传入的回调是一个对象，则将其转成函数形式
    if (isPlainObject(cb)) {
      // 将对象中的 handler 提取出来，以 cb 为函数形式调用 $watch
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    // 设置为 user watcher
    options.user = true
    // 创建 Watcher 实例
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      const info = `callback for immediate watcher "${watcher.expression}"`
      // user watcher 有 immediate 时 让 Dep.target = undefined 让 watcher 栈顶传入 undefined
      // 在不触发依赖收集的情况下执行 cb
      pushTarget()
      // 这里的 watcher.value 就是创建 user watcher 时，执行 get() 获取到的 监听的data值
      invokeWithErrorHandling(cb, vm, [watcher.value], vm, info)
      // 执行完后将 watcher 栈复原
      popTarget()
    }
    // 返回一个取消 watch 的函数
    return function unwatchFn () {
      // 取消 watcher
      watcher.teardown()
    }
  }
}
