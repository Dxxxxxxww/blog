/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0

/**
 * 初始化 _init 函数
 * 这个函数不是初始化 Vue.mixin 的。需要区分开来
 */
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    // 保存 vue 实例
    const vm: Component = this
    // a uid
    // 设置实例唯一标识 初始为0
    vm._uid = uid++

    let startTag, endTag
    /* istanbul ignore if */
    // 开发环境性能检测
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    // 设置 vue 实例标识，跳过 observe 响应式处理数据
    vm._isVue = true
    // merge options 合并配置
    // 合并 options 将传入的 options 与初始化时构造函数生成的 options 合并
    // 如果是组件
    // 单文件组件都会进入到这里
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // 优化内部组件实例化;
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      // 由于动态选项合并非常慢，而且没有
      // 内部组件选项需要特殊处理。
      initInternalComponent(vm, options)
    } else {
      // new Vue 创建实例会进入到这里
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    // render 代理，在render函数上访问相关数据，函数会进入这里，比如说_c _v _s template中所用到的数据
    if (process.env.NODE_ENV !== 'production') {
      // 开发模式下调用 new Proxy() 获取实例 作为 vm._renderProxy
      initProxy(vm)
    } else {
      // 生产模式设置渲染代理对象为本身，Vue 实例
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // vm(Vue 实例)的生命周期相关变量初始化 挂载一些实例属性以及私有实例属性。将当前实例添加到父实例的子列表中
    // $children $parent $root $refs
    initLifecycle(vm)
    // vm 的事件中心初始化，监听父组件绑定在当前组件上的事件
    initEvents(vm)
    // vm 的编译 render 初始化
    // $slots $scopedSlots，_c，$createElement(render 的参数 h 函数)，$attrs，$listeners
    // 为了更方便的创建 HOC 设置 $attrs，$listeners 为响应式的
    initRender(vm)
    // 调用 beforeCreate 生命周期钩子
    callHook(vm, 'beforeCreate')
    // resolve injections before data/props
    // 在 data props 初始化前先注入 inject
    // 把 inject 的成员注入到 vm 上
    initInjections(vm)
    // 初始化 props methods data computed watch
    // 初始化 vm 的 _props methods _data computed watch
    initState(vm)
    // resolve provide after data/props
    // 在 data props 初始化之后初始化 provide
    // 初始化 provide 初始化 vm._provided
    initProvide(vm)
    // 调用 created 生命周期钩子
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

export function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  const opts = vm.$options = Object.create(vm.constructor.options)
  // doing this because it's faster than dynamic enumeration.
  const parentVnode = options._parentVnode
  opts.parent = options.parent
  opts._parentVnode = parentVnode

  const vnodeComponentOptions = parentVnode.componentOptions
  opts.propsData = vnodeComponentOptions.propsData
  opts._parentListeners = vnodeComponentOptions.listeners
  opts._renderChildren = vnodeComponentOptions.children
  opts._componentTag = vnodeComponentOptions.tag

  if (options.render) {
    opts.render = options.render
    opts.staticRenderFns = options.staticRenderFns
  }
}

export function resolveConstructorOptions (Ctor: Class<Component>) {
  let options = Ctor.options
  if (Ctor.super) {
    const superOptions = resolveConstructorOptions(Ctor.super)
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  return options
}

function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  const latest = Ctor.options
  const sealed = Ctor.sealedOptions
  for (const key in latest) {
    if (latest[key] !== sealed[key]) {
      if (!modified) modified = {}
      modified[key] = latest[key]
    }
  }
  return modified
}
