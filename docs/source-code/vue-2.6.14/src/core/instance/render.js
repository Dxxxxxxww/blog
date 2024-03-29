/* @flow */

import {
  warn,
  nextTick,
  emptyObject,
  handleError,
  defineReactive
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { installRenderHelpers } from './render-helpers/index'
import { resolveSlots } from './render-helpers/resolve-slots'
import { normalizeScopedSlots } from '../vdom/helpers/normalize-scoped-slots'
import VNode, { createEmptyVNode } from '../vdom/vnode'

import { isUpdatingChildComponent } from './lifecycle'

export function initRender (vm: Component) {
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null // v-once cached trees
  const options = vm.$options
  // vm.$vnode options._parentVnode 占位 vnode
  const parentVnode = vm.$vnode = options._parentVnode // the placeholder node in parent tree
  const renderContext = parentVnode && parentVnode.context
  // 解析插槽
  vm.$slots = resolveSlots(options._renderChildren, renderContext)
  vm.$scopedSlots = emptyObject
  // bind the createElement fn to this instance
  // 给当前实例绑定 createElement 方法
  // so that we get proper render context inside it.
  // 这样我们就可以得当合理的上下文
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // 参数要求：标签，数据，子级，normalizationType，alwaysNormalize
  // internal version is used by render functions compiled from templates
  // 编译生成的 render 进行渲染使用的方法
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  // normalization is always applied for the public version, used in
  // user-written render functions.
  // h函数 手写 render 进行渲染使用的方法
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)

  // $attrs & $listeners are exposed for easier HOC creation.
  // 为了更方便的创建 HOC 暴露 $attrs & $listeners
  // they need to be reactive so that HOCs using them are always updated
  // 他们需要成为响应式的，这样 HOC 使用起来就总能拿到最新的
  const parentData = parentVnode && parentVnode.data

  /* istanbul ignore else */
  // 开发环境下设置响应式时增加 自定义setter 用来在 set 时报错
  if (process.env.NODE_ENV !== 'production') {
    // 生成第一个 dep ，dep id 为 0
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$attrs is readonly.`, vm)
    }, true)
    // 生成第二个 dep ，dep id 为 1
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, () => {
      !isUpdatingChildComponent && warn(`$listeners is readonly.`, vm)
    }, true)
  } else {
    defineReactive(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true)
    defineReactive(vm, '$listeners', options._parentListeners || emptyObject, null, true)
  }
}

export let currentRenderingInstance: Component | null = null

// for testing only
export function setCurrentRenderingInstance (vm: Component) {
  currentRenderingInstance = vm
}

export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  // render-helpers/index.js
  // installRenderHelpers 注册一些编译时使用的工具函数，在 render 中使用
  installRenderHelpers(Vue.prototype)

  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    // 用户自己写的和编译生成的 render 都会放到 options 上，所以这里直接从 options 中获取
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
      vm.$scopedSlots = normalizeScopedSlots(
        _parentVnode.data.scopedSlots,
        vm.$slots,
        vm.$scopedSlots
      )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      // There's no need to maintain a stack because all render fns are called
      // 没有必要维护一个堆栈，因为所有的渲染 fns 都是相互独立调用的
      // separately from one another. Nested component's render fns are called
      // when parent component is patched.
      // 当父组件被 patched ，嵌套组件的渲染 fns 被调用
      currentRenderingInstance = vm
      // h 函数 -> vm.$createElement
      // render 函数执行，会先创建子级的 vnode，再创建父级的 vnode，
      // 这是正常的，就好比函数执行，传递了一个函数调用结果的参数，也会先执行这个函数获取结果作为参数。
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
        try {
          vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        } catch (e) {
          handleError(e, vm, `renderError`)
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    } finally {
      currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
      vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    // 建立组件 vnode 与组件占位 vnode 的父子关系
    // 对于 keep-alive 来说
    // 组件占位 vnode 的 parent 是 keepAlive 的占位 vnode，
    // keepAlive 实例的 _vnode(真实 vnode)是其子组件的占位 vnode，因为 keep-alive render 返回子级组件占位 vnode
    vnode.parent = _parentVnode
    return vnode
  }
}
