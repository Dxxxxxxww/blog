/* @flow */

import config from '../config'
import { warn } from './debug'
import { set } from '../observer/index'
import { unicodeRegExp } from './lang'
import { nativeWatch, hasSymbol } from './env'

import {
  ASSET_TYPES,
  LIFECYCLE_HOOKS
} from 'shared/constants'

import {
  extend,
  hasOwn,
  camelize,
  toRawType,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from 'shared/util'

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies

/**
 * Options with restrictions
 * 对于 el 和 propsData 属性的合并，在 Vue 中使用了默认合并策略，也就是子项优先。
 * 原因很简单，因为 el 和 propsData 只允许有一份。
 * #
 */
if (process.env.NODE_ENV !== 'production') {
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}

/**
 * Helper that recumergeDatarsively merges two data objects together.
 * data 的合并策略依然是子项优先
 */
function mergeData (to: Object, from: ?Object): Object {
  if (!from) return to
  let key, toVal, fromVal

  const keys = hasSymbol
    ? Reflect.ownKeys(from)
    : Object.keys(from)

  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    // in case the object is already observed...
    if (key === '__ob__') continue
    toVal = to[key]
    fromVal = from[key]
    // 子项没有，父项有，则把值赋给子项
    if (!hasOwn(to, key)) {
      set(to, key, fromVal)
    // 子项有有，父项有，且都是对象，则递归调用 mergeData
    } else if (
      toVal !== fromVal &&
      isPlainObject(toVal) &&
      isPlainObject(fromVal)
    ) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 * 合并策略是子项优先
 */
export function mergeDataOrFn (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  // 虽然根据 vm 进行了区分，但是思路都是一样的，返回一个 data 函数，函数中会返回合并的 data 对象。
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    // 在 Vue.extend 合并中，parentVal，childVal 都需要是 function
    if (!childVal) {
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      // 合并函数执行后的对象
      // 合并策略依然是子项优先
      return mergeData(
        typeof childVal === 'function' ? childVal.call(this, this) : childVal,
        typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
      )
    }
  } else {
    return function mergedInstanceDataFn () {
      // instance merge
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm, vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm, vm)
        : parentVal
      if (instanceData) {
        // 合并函数执行后的对象
        // 合并策略依然是子项优先
        return mergeData(instanceData, defaultData)
      } else {
        return defaultData
      }
    }
  }
}
// data 的合并策略设置, data 的合并策略 比 provide 多包裹了一层函数。provide 直接使用 mergeDataOrFn
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  if (!vm) {
    // 对 childVal 进行了检验，如果不是函数类型，提示错误信息并直接返回父项
    if (childVal && typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )

      return parentVal
    }
    return mergeDataOrFn(parentVal, childVal)
  }

  return mergeDataOrFn(parentVal, childVal, vm)
}

/**
 * Hooks and props are merged as arrays.
 * 生命周期钩子在内部是以函数数组的形式存在 [Function]
 * 将子项的生命周期钩子添加到父项的末尾
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  // 首先判断了是否有childVal(子项生命周期)，如果没有则直接返回parentVal；
  const res = childVal
    // 如果有，再判断 parentVal(父项声明周期) 有没有，
    ? parentVal
      // 如果有则一定是数组形式，这个时候直接把 childVal 添加到 parentVal 数组的末尾；
      // 所以会先执行父项的生命周期钩子
      ? parentVal.concat(childVal)
      // 如果没有，则需要判断一下 childVal 是不是数组，
      : Array.isArray(childVal)
        // 如果不是数组则转成数组，如果已经是数组了，则直接返回。
        ? childVal
        : [childVal]
    : parentVal
  return res
    // 去重
    ? dedupeHooks(res)
    : res
}

// 去重
function dedupeHooks (hooks) {
  const res = []
  for (let i = 0; i < hooks.length; i++) {
    if (res.indexOf(hooks[i]) === -1) {
      res.push(hooks[i])
    }
  }
  return res
}
// LIFECYCLE_HOOKS = [
//   'beforeCreate',
//   'created',
//   'beforeMount',
//   'mounted',
//   'beforeUpdate',
//   'updated',
//   'beforeDestroy',
//   'destroyed',
//   'activated',
//   'deactivated',
//   'errorCaptured',
//   'serverPrefetch'
// ]
// 生命周期合并
LIFECYCLE_HOOKS.forEach(hook => {
  // 给 Vue.config.optionMergeStrategies 赋值，生命周期的合并策略使用 mergeHook
  strats[hook] = mergeHook
})

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 * 父级作为原型，子级作为选项对象属性
 */
function mergeAssets (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): Object {
  // 以 parentVal 为原型创建一个对象
  const res = Object.create(parentVal || null)
  if (childVal) {
    process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm)
    // 把子项的值都拷贝到 res 上
    return extend(res, childVal)
  } else {
    return res
  }
}

// components, filters, directives 的合并策略
// 父级作为原型，子级作为选项对象属性
ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})

/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 * watch 的合并策略
 */
strats.watch = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  // work around Firefox's Object.prototype.watch...
  // 排除 Firefox's Object.prototype.watch
  // nativeWatch Firefox 环境下原生的 Object.prototype.watch
  if (parentVal === nativeWatch) parentVal = undefined
  if (childVal === nativeWatch) childVal = undefined
  /* istanbul ignore if */
  // childVal 没有时，直接返回以 parentVal 为原型创建的对象
  if (!childVal) return Object.create(parentVal || null)
  if (process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  // 没有父项直接返回子项
  if (!parentVal) return childVal
  const ret = {}
  // 把父项属性都赋值到 ret 上
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    // 与生命周期钩子的合并类似，将父子项合并到同一个 watch 数组中
    ret[key] = parent
      // parent 在 child 之前，所以会优先执行 parent 的 watch。会优先执行 mixins 里的
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}

/**
 * Other object hashes.
 * 设置 props，methods，inject，computed 的默认合并策略
 * 这几种配置有一个共同点：不允许存在相同的属性
 */
strats.props =
strats.methods =
strats.inject =
strats.computed = function (
  parentVal: ?Object,
  childVal: ?Object,
  vm?: Component,
  key: string
): ?Object {
  if (childVal && process.env.NODE_ENV !== 'production') {
    assertObjectType(key, childVal, vm)
  }
  // 没有父项直接返回子项
  if (!parentVal) return childVal
  // 创建一个没有原型的对象
  const ret = Object.create(null)
  // 把父项赋值到结果对象上
  extend(ret, parentVal)
  // 把子项赋值到结果对象上，如果有同名属性直接覆盖
  if (childVal) extend(ret, childVal)
  return ret
}
// provide 合并策略设置
strats.provide = mergeDataOrFn

/**
 * Default strategy.
 * 子级属性如果不存在就取父级属性，如果存在则取子级
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Validate component names
 */
function checkComponents (options: Object) {
  for (const key in options.components) {
    validateComponentName(key)
  }
}

export function validateComponentName (name: string) {
  if (!new RegExp(`^[a-zA-Z][\\-\\.0-9_${unicodeRegExp.source}]*$`).test(name)) {
    warn(
      'Invalid component name: "' + name + '". Component names ' +
      'should conform to valid custom element name in html5 specification.'
    )
  }
  if (isBuiltInTag(name) || config.isReservedTag(name)) {
    warn(
      'Do not use built-in or reserved HTML elements as component ' +
      'id: ' + name
    )
  }
}

/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 * 规范 props 属性
 */
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  // 处理数组形式的 props  props: ['propA', 'propB']
  if (Array.isArray(props)) {
    // 倒序遍历这个数组
    i = props.length;
    while (i--) {
      val = props[i];
      // 如果数组项是字符串类型
      if (typeof val === "string") {
        // 将 key 转为驼峰形式
        name = camelize(val);
        /**
         * 将 props 改成
         * props: {
         *    propsA: {
         *        type: null
         *    }
         * }
         */
        res[name] = { type: null };
        // 开发模式下，数组项类型不是 string 直接报错，props 数组形式，项只能是 string
      } else if (process.env.NODE_ENV !== "production") {
        warn("props must be strings when using array syntax.");
      }
    }
    // 处理普通对象形式的 props
    /** 普通对象形式
     * props: {
     *    propsA: String
     * }
     */
  } else if (isPlainObject(props)) {
    for (const key in props) {
      val = props[key]
      // 将 key 转为驼峰形式
      name = camelize(key)
      // 如果 propA 的值已经是对象形式了就不做任何处理
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
}

/**
 * Normalize all injections into Object-based format
 */
function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}

/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

function assertObjectType (name: string, value: any, vm: ?Component) {
  if (!isPlainObject(value)) {
    warn(
      `Invalid value for option "${name}": expected an Object, ` +
      `but got ${toRawType(value)}.`,
      vm
    )
  }
}

/**
 * Merge two option objects into a new one.
 * 将两个选项对象合并进一个新的选项对象中
 * Core utility used in both instantiation and inheritance.
 * 用于实例化和继承的核心实用程序
 * 只有三种情况调用 mergeOptions 时不会传递 vm
 * 1. Vue.mixin，全局混入时组件都没有调用，自然不会有 vm。
 * 2. Vue.extend 中建立组件构造函数时，设置构造函数静态选项
 * 3. _init 中，resolveConstructorOptions 函数内部进行构造函数的选项合并时。
 * 可以看出，都是针对构造函数选项的混入时，就不会传递 vm 了。
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }
  // 如果是函数，则为组件构造函数
  if (typeof child === 'function') {
    child = child.options
  }

  // 规范 props 属性
  normalizeProps(child, vm)
  // 规范 inject
  normalizeInject(child, vm)
  // 规范 指令
  normalizeDirectives(child)

  // Apply extends and mixins on the child options,
  // 在子选项上添加 extends 和 mixins
  // but only if it is a raw options object that isn't
  // 只限于是一个原始选项对象，
  // the result of another mergeOptions call.
  // 而不是另一个合并选项调用的结果
  // Only merged options has the _base property.
  // 只合并不带有 _base 的选项。带有 _base 也就是 Vue 组件构造函数
  if (!child._base) {
    if (child.extends) {
      parent = mergeOptions(parent, child.extends, vm)
    }
    // 合并 mixins
    if (child.mixins) {
      for (let i = 0, l = child.mixins.length; i < l; i++) {
        // 这里现将 mixin 上的选项合并到 parent 上面，然后再在下面进行遍历 child 的属性时，才会把其自身的配置合并对应的位置
        parent = mergeOptions(parent, child.mixins[i], vm)
      }
    }
  }
  // 在处理 parent child 属性之前，已经优先处理了 extend 和 mixin，将 extend 和 mixin 赋值给 parent，
  // 而在生命周期钩子合并时，child 会合并到 parent 之后。
  // 这就是为什么我们使用 mixin 混入，里面如果写了生命周期钩子函数，会优先于组件的生命周期钩子执行。
  // watch 同样也是 parent 先执行，child 后执行。
  const options = {}
  let key
  // 先按照父级的 key 来将属性赋值到 options 上
  // 如果子级有相同的 key，且值存在就用子级的
  for (key in parent) {
    mergeField(key)
  }
  // 再将只在子级选项上有的属性赋值到 options 上
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
  function mergeField (key) {
    // config.optionMergeStrategies 默认是一个空对象，在这个文件中会添加相应的合并策略，
    // 包括 props，methods，inject，computed，生命周期钩子，components, directives, filters, watch，data, provide
    // 用户可以修改这个自定义合并策略的选项。
    // https://cn.vuejs.org/v2/api/#optionMergeStrategies
    // defaultStrat，子项属性优先，也就是如果子项属性存在，就取子项。否则取父项
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
