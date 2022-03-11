/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

/**
 * 初始化 Vue.extend
 */
export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   * @param {Object} extendOptions 传入的组件，被继承者
   */
  Vue.extend = function (extendOptions: Object): Function {
    // 传入的组件，被继承者
    extendOptions = extendOptions || {}
    // 存储 Vue 构造函数
    const Super = this
    // Vue 构造函数 Id
    const SuperId = Super.cid
    // 如果是已经注册过的组件，则从缓存中加载组件的构造函数
    // 这个缓存相当于是  Sub._Ctor[Vue构造函数Id] = Sub
    // 这种方式能保证所有使用 Vue.extend 产生的组件，它的 key 都是相同的，都是 Vue 的 id
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      // 验证组件名称
      validateComponentName(name)
    }
    // 创建组件构造函数，继承者
    const Sub = function VueComponent (options) {
      // 同样的，组件构造函数中需要调用 _init
      this._init(options)
    }
    // 继承 Vue
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    // 合并Vue的选项，传入组件的选项
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    // 对于props和computed属性，
    // 在继承时，在继承的原型上，我们对Vue实例定义了代理 getter
    // 这避免对每个已经创建的实例调用 Object.defineProperty。
    // 如果子类包含 props 对其进行初始化，进行 proxy 代理
    if (Sub.options.props) {
      initProps(Sub)
    }
    // 如果子类包含 computed 对其进行初始化
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    // 复制静态方法
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
    // 复制静态方法
    // 'component', 'directive', 'filter'
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    // 在组件自身中注册自己，支持递归调用
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    // 在继承时保持对父级 options 的引用
    // 稍后在实例化时，我们可以检查Super的选项是否有更新。
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    // 保存构造函数缓存
    // 这个缓存相当于是  Sub._Ctor[Vue构造函数Id] = Sub
    cachedCtors[SuperId] = Sub
    return Sub
  }
}

function initProps (Comp) {
  const props = Comp.options.props
  for (const key in props) {
    proxy(Comp.prototype, `_props`, key)
  }
}

function initComputed (Comp) {
  const computed = Comp.options.computed
  for (const key in computed) {
    defineComputed(Comp.prototype, key, computed[key])
  }
}
