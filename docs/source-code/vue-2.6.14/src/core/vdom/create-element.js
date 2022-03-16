/* @flow */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'
import { traverse } from '../observer/traverse'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// 为包装器函数提供了更加灵活的接口
// without getting yelled at by flow
// 处理参数，最终调用 _createElement 返回 vnode
export function createElement (
  // vm 实例
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode | Array<VNode> {
  // 如果 data 是数组(子节点)/原始值(标签内容)，说明此时的 data 是 children
  if (Array.isArray(data) || isPrimitive(data)) {
    // 将参数都后移
    normalizationType = children
    children = data
    data = undefined
  }
  // 判断最后一个参数，用户传入的 render 是 true，编译生成的是 false
  if (isTrue(alwaysNormalize)) {
    // 用来处理 children 参数
    normalizationType = ALWAYS_NORMALIZE
  }
  // 返回 vnode
  return _createElement(context, tag, data, children, normalizationType)
}
// 通过条件判断来产生不同的 vnode 节点，封装 vnode 的创建
export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode | Array<VNode> {
  // 如果 data 是响应式数据，则报警
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    // 返回 空vnode节点-注释节点
    return createEmptyVNode()
  }
  // object syntax in v-bind
  // v-bind 的对象语法
  // <component v-bind:is="currentTabComponent"></component> vue 中实现 HOC 的一种形式
  // data 中的 is 就是这个作用，把对应的组件拿出来当成标签
  if (isDef(data) && isDef(data.is)) {
    tag = data.is
  }
  // 如果没有标签，返回一个 空vnode节点-注释节点
  if (!tag) {
    // in case of component :is set to falsy value
    // 也是 component :is 设置了一个 falsy 值的兜底措施
    return createEmptyVNode()
  }
  // warn against non-primitive key
  // 对非原始值的 key 报警
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    if (!__WEEX__ || !('@binding' in data.key)) {
      warn(
        'Avoid using non-primitive value as key, ' +
        'use string/number value instead.',
        context
      )
    }
  }
  // support single function children as default scoped slot
  // 处理作用域插槽，先跳过
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // 相等说明是用户传递的 render
  if (normalizationType === ALWAYS_NORMALIZE) {
    // 处理children，不管用户传入数组/原始值，最终返回一维数组
    children = normalizeChildren(children)
    // 编译生成的 render
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    // 处理children，把二维数组转换为一维数组
    children = simpleNormalizeChildren(children)
  }
  let vnode, ns
  // tag 是字符串
  if (typeof tag === 'string') {
    let Ctor
    ns = (context.$vnode && context.$vnode.ns) || config.getTagNamespace(tag)
    // 如果是保留标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      if (process.env.NODE_ENV !== 'production' && isDef(data) && isDef(data.nativeOn) && data.tag !== 'component') {
        warn(
          `The .native modifier for v-on is only valid on components but it was used on <${tag}>.`,
          context
        )
      }
      // 创建 vnode对象
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    // tag 不是保留标签，并且 data 不存在 && 对组件名称做处理，查找自定义组件
    // 问题？？
    } else if (
      (!data || !data.pre)
      && isDef(Ctor = resolveAsset(context.$options, 'components', tag))
    ) {
      // component
      // 创建自定义组件
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // tag 不是 保留标签
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      // 未知或未列出名称空间的元素会在运行时进行检查，
      // 因为当它的父元素规范化子元素时，
      // 它可能会被分配一个名称空间
      // 创建 vnode
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // tag 不是字符串
    // direct component options / constructor
    // 创建组件
    vnode = createComponent(tag, data, context, children)
  }
  // 是数组则直接返回 vnode
  if (Array.isArray(vnode)) {
    return vnode
  // vnode 已经定义了
  } else if (isDef(vnode)) {
    // 如果定义了命名空间，处理 vnode 的命名空间
    if (isDef(ns)) applyNS(vnode, ns)
    // 处理 data
    if (isDef(data)) registerDeepBindings(data)
    return vnode
  } else {
    // 以上条件都不满足，返回空vnode节点-注释节点
    return createEmptyVNode()
  }
}

function applyNS (vnode, ns, force) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    ns = undefined
    force = true
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && (
        isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
        applyNS(child, ns, force)
      }
    }
  }
}

// ref #5318
// necessary to ensure parent re-render when deep bindings like :style and
// :class are used on slot nodes
// 当在 slot 上使用 :style :class 这样的深度绑定时 确保父元素重新呈现是必要的
// 内部使用 traverse，与 watcher 中 deep: true 中使用的函数一致
function registerDeepBindings (data) {
  if (isObject(data.style)) {
    traverse(data.style)
  }
  if (isObject(data.class)) {
    traverse(data.class)
  }
}
