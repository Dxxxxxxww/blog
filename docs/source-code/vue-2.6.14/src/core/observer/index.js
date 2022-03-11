/* @flow */

import Dep from './dep'
import VNode from '../vdom/vnode'
import { arrayMethods } from './array'
import {
  def,
  warn,
  hasOwn,
  hasProto,
  isObject,
  isPlainObject,
  isPrimitive,
  isUndef,
  isValidArrayIndex,
  isServerRendering
} from '../util/index'

// Object.getOwnPropertyNames() 方法
// 返回一个由指定对象的所有自身属性的属性名（包括不可枚举属性但不包括Symbol值作为名称的属性）组成的数组
// 通过该方法获取增强之后的数组方法名，其实也就是 methodsToPatch
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)

/**
 * In some cases we may want to disable observation inside a component's
 * update computation.
 */
export let shouldObserve: boolean = true

export function toggleObserving (value: boolean) {
  shouldObserve = value
}

/**
 * Observer class that is attached to each observed
 * object. Once attached, the observer converts the target
 * object's property keys into getter/setters that
 * collect dependencies and dispatch updates.
 * 附属于每个被观察对象的观察者类
 * 对象。一旦连接上，观察者
 * 转换目标对象的属性键变成 getter/setter
 * 用于收集依赖项并分派更新。
 * Observer 与 defineReactive 联合进行的依赖收集是一种深度优先遍历。
 */
export class Observer {
  // 观测对象
  value: any;
  // 依赖池，用于对对象/数组本身上进行依赖收集
  // 1.解决循环对象 2. 解决新增属性的问题
  // 对于数组来说，这里的 dep 就是其在 升级版api 中进行派发更新的关键了
  // 对于对象来说，这里的 dep 就是在 $set $delete 时派发更新的关键了
  dep: Dep;
  // 实例计数器  如果是根数据，则需要将 vmCount 计数自增
  vmCount: number; // number of vms that have this object as root $data
  // 使用该变量作为拥有根数据的实例统计数量
  // 所有 Vue 实例的 $data 根数据都有 vmCount

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    // 初始化实例的 vmCount 为 0
    this.vmCount = 0
    // 将 Observer 实例挂载到观察对象的 __ob__ 属性
    // 没有给 def 传递第四个参数，__ob__ 不可枚举
    // 这样做的目的是在遍历 data 做 getter/setter 时避免给 __ob__ 也设置了
    // __ob__ 只是用来记录 Observer 实例，不需要响应式处理
    // 不管是数组，还是对象，都会在其本身上设置该属性。
    // obj = { a: '1'} ->   { a: '1', __ob__: observer }
    // arr = [1, 2, 3] -> [1, 2, 3, __ob__]
    def(value, '__ob__', this)
    // 数组的响应式处理
    if (Array.isArray(value)) {
      // 判断能不能使用 __proto__
      if (hasProto) {
        // 通过使用 __proto__ 来截取原型链 来增强 Object or Array
        // 修改对象的 __proto__ 的指向
        // arrayMethods：重新定义修改数组的方法集合/增强方法集合
        protoAugment(value, arrayMethods)
      } else {
        // 在数组上直接定义增强方法，不改变原型
        copyAugment(value, arrayMethods, arrayKeys)
      }
      // 给数组中的每一项创建观察者实例，也就是深度遍历设置。内部调用 observe，observe 再回到这个 Observer
      // 从这里可以看出，如果数组项是基本类型，是不会做响应式处理的，如果数组项是对象，才会做响应式处理
      this.observeArray(value)
    } else {
      // 对象的响应式处理
      // 遍历对象，设置 getter/setter，内部调用 defineReactive
      this.walk(value)
    }
  }

  /**
   * Walk through all properties and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   * 遍历对象，设置 getter/setter 内部调用 defineReactive
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }

  /**
   * Observe a list of Array items.
   * 遍历调用 observe
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

// helpers

/**
 * Augment a target Object or Array by intercepting
 * the prototype chain using __proto__
 * 通过使用 __proto__ 来截取原型链 来增强 Object or Array
 * 修改对象的 __proto__ 的指向
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * Augment a target Object or Array by defining
 * hidden properties.
 * 通过定义隐藏属性来增强 Object or Array
 *
 * 也就是直接在当前数组对象上定义 push pop 等等增强方法，
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}

/**
 * Attempt to create an observer instance for a value,
 * 尝试为一个值创建一个 Observer 实例
 * returns the new observer if successfully observed,
 * 如果成功创建，返回新的观察者
 * or the existing observer if the value already has one.
 * 如果value已经有 Observer 实例了，那就返回现有的观察者
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  // 如果不是一个对象 || 是 VNode 的实例 不需要生成观察者实例，直接返回
  if (!isObject(value) || value instanceof VNode) {
    return
  }
  let ob: Observer | void
  // 如果有 __ob__(observer对象) 属性，说明已经有观察者实例了，直接返回现有观察者实例
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    ob = value.__ob__
  } else if (
    // 全局变量，通过 toggleObserving 来改变 true || false
    // 需要观测的
    shouldObserve &&
    // 不是 SSR
    !isServerRendering() &&
    // 是数组 || 是纯粹的 js 对象
    (Array.isArray(value) || isPlainObject(value)) &&
    // 是可扩展的
    Object.isExtensible(value) &&
    // 不是Vue实例。如果是 Vue 实例 不需要生成观察者实例。vm 会在 _init 中 初始化为 true
    !value._isVue
  ) {
    // 满足以上所有条件，创建 Observer 对象
    ob = new Observer(value)
  }
  // 如果是根数据，则需要将 vmCount 计数自增
  if (asRootData && ob) {
    ob.vmCount++
  }
  // 返回实例
  return ob
}

/**
 * Observer 与 defineReactive 联合进行的依赖收集是一种深度优先遍历。
 * Define a reactive property on an Object.
 * 设置响应式对象 设置 getter setter。
 * 在 getter 中收集观察者，在 setter 中 触发观察者相应函数。
 * 需要注意的是 defineReactive 是对对象的 key 进行拦截的，所以这里生成的 dep 也是针对 key 的。
 * 也就是说如果定义了一个数据 data.arr = [1,2,3]，
 * 针对 data 这个对象，arr 这个键，也是会走到 defineReactive 的。
 * 只有 data 会在这里进行响应式处理，props computed watcher 都不会在这里进行处理。
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: ?Function,
  shallow?: boolean
) {
  // 创建依赖池，用于对 key 进行依赖收集
  // 这是因为 key 对应的值可以改变赋值
  const dep = new Dep()
  // 获取对象的属性描述器
  const property = Object.getOwnPropertyDescriptor(obj, key)
  // 如果属性是不可配置的，就直接返回
  if (property && property.configurable === false) {
    return
  }

  // cater for pre-defined getter/setters
  // 用户传入的对象可能已经设置了 getter/setter
  const getter = property && property.get
  const setter = property && property.set
  // 如果没有( getter 或者 只有 setter ) && 传入的参数只有两个-> obj key
  // 就去获取 val
  // 否则就通过 getter 来获取值
  if ((!getter || setter) && arguments.length === 2) {
    val = obj[key]
  }
  // 如果不是浅层的话 就递归定义 getter/setter
  // childOb 是 observe 返回的 Observe 实例，实例对象上会定义 dep 属性
  // sonData 子级(第二层)对象数据上会有 __ob__ 属性，值为 childOb
  // childOb.dep = Dep 的实例
  let childOb = !shallow && observe(val)
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get: function reactiveGetter () {
      // 如果用户定义的 getter 存在，则通过 getter 获取 value，否则直接获取
      const value = getter ? getter.call(obj) : val
      // 如果存在当前依赖目标，即 watcher，则收集依赖。
      // Dep.target 会使用 dep.js 中的 pushTarget 赋值，
      // 而 pushTarget 在 watcher 执行 get() 的时候才会真正传入 watcher。
      // 只要栈顶有watcher，只要访问数据就会进行依赖收集
      if (Dep.target) {
        // 将数据与 watcher 建立依赖关系
        // 内部调用 watcher 的 addDep 方法
        // addDep 内部又会去调用 dep.addSub
        // 致使 watcher 与 dep 形成多对多的关系
        dep.depend()
        // 如果需要深层响应式，则对子级(第二层)也进行依赖收集
        // 如果 childOb 是数组，这里也会使用数组的 dep 进行依赖收集
        if (childOb) {
          // 子级(第二层)对象的__ob__的dep进行依赖收集
          childOb.dep.depend()
          if (Array.isArray(value)) {
            // 内部遍历数组，对是对象的数组项进行依赖收集，如果还是数组则递归。
            dependArray(value)
          }
        }
      }
      // 返回属性值
      return value
    },
    set: function reactiveSetter (newVal) {
      // 如果用户定义的 getter 存在，则通过 getter 获取 value，否则直接获取
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      // 核心就是判断新值与旧值是否相等，如果相等则直接返回，不触发更新
      // newVal !== newVal && value !== value 是判断 NaN 的情况，因为 NaN 不等于自身
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }
      /* eslint-enable no-self-compare */
      // 一般都是内部用来传递报错函数，用以警告某些属性不能进行赋值，比如 $attrs $listeners
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      // #7981: for accessor properties without setter
      // 如果只有 getter 没有 setter 说明是只读的，就直接返回
      // 只设置getter，不设置setter，属性值无法改变
      if (getter && !setter) return
      // 如果有传入自定义 setter 则在 set 的时候执行
      if (setter) {
        setter.call(obj, newVal)
      } else {
        // 如果既没有 getter 也没有 setter 就直接赋值
        val = newVal
      }
      // 如果新值是对象，则也需要响应式处理
      childOb = !shallow && observe(newVal)
      // 派发更新
      dep.notify()
    }
  })
}

/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 * 设置对象的属性。添加新属性并当该属性原本不存在时触发更改通知。
 */
export function set (target: Array<any> | Object, key: any, val: any): any {
  // 如果是 undefined 或者是 原始值的话，则报警
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot set reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 给数组新增成员时，使用升级版 splice
  // 如果是数组，且 key 是合法的数组索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 将 数组长度 与 索引 比较，取大值赋给数组长度
    target.length = Math.max(target.length, key)
    // 通过 splice 对 索引位置的元素进行替换（新增）
    // 这里的 splice 是升级版api，不是数组原生的
    target.splice(key, 1, val)
    return val
  }
  // 如果 key 已经在这个对象上存在就直接赋值
  if (key in target && !(key in Object.prototype)) {
    target[key] = val
    return val
  }
  // 获取 target 的 observe 对象
  const ob = (target: any).__ob__
  // 如果对象是 Vue 实例或者 是 $data 根数据 则报错，不允许对 vm 和 $data 做 $set 操作
  // $data 根数据的 ob 对象上的 vmCount 为 1，其他都是0
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  // 如果没有 ob，则说明不是响应式对象，就不需要响应式处理，直接赋值
  if (!ob) {
    target[key] = val
    return val
  }
  // 给对象新增成员时 ，使用 defineReactive 设置响应式
  defineReactive(ob.value, key, val)
  // 派发更新
  // 这里的 dep 就是 new Observe 实例时创建的 ob
  ob.dep.notify()
  return val
}

/**
 * Delete a property and trigger change if necessary.
 * 删除属性并触发更改。
 */
export function del (target: Array<any> | Object, key: any) {
  // 如果是 undefined 或者是 原始值的话，则报警
  if (process.env.NODE_ENV !== 'production' &&
    (isUndef(target) || isPrimitive(target))
  ) {
    warn(`Cannot delete reactive property on undefined, null, or primitive value: ${(target: any)}`)
  }
  // 给数组删除成员时，使用升级版 splice
  // 如果是数组，且 key 是合法的数组索引
  if (Array.isArray(target) && isValidArrayIndex(key)) {
    // 这里删除后直接 return 是因为 升级版的数组 api 中已经会去做 notify 操作
    target.splice(key, 1)
    return
  }
  // 获取 target 的 observe 对象
  const ob = (target: any).__ob__
  // 如果对象是 Vue 实例或者 是 $data 根数据 则报错，不允许对 vm 和 $data 做 $del 操作
  // $data 根数据的 ob 对象上的 vmCount 为 1，其他都是0
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  // 如果当前对象上没有对应的 key 属性（继承的也不算，只能是自身的）直接返回
  if (!hasOwn(target, key)) {
    return
  }
  // 删除属性
  delete target[key]
  // 如果没有 ob，则说明不是响应式对象，就不需要响应式处理，直接返回
  if (!ob) {
    return
  }
  // 派发更新
  // 这里的 dep 就是 new Observe 实例时创建的 ob
  ob.dep.notify()
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 * 当数组被访问时，收集数组元素的依赖，
 * 因为我们不能用 getter 属性那样来拦截数组元素的访问。
 * 内部遍历数组，对是对象的数组项进行依赖收集，如果还是数组则递归。
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    // 有 __ob__ 说明 e 是对象/数组
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}
