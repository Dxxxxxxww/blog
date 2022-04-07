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
  // vm 实例，开发环境下是 vm_renderProxy
  context: Component,
  // 标签，可以是正常的HTML元素标签，也可以是Component组件。
  tag: any,
  // VNode的数据，其类型为VNodeData，可以在根目录flow/vnode.js文件中看到其具体定义。undefined。
  data: any,
  // VNode的子节点。
  children: any,
  // children子节点规范化类型。
  normalizationType: any,
  // 是否总是规范化，_c false, h true
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
// 通过条件判断来产生不同的 vnode 节点，封装 vnode 的创建。
// 主要做两件事情：规范化子节点和创建VNode节点。
export function _createElement (
  // vm 实例，开发环境下是 vm_renderProxy
  context: Component,
  // 标签，可以是正常的HTML元素标签，也可以是Component组件。
  tag?: string | Class<Component> | Function | Object,
  // VNode的数据，其类型为VNodeData，可以在根目录flow/vnode.js文件中看到其具体定义。
  data?: VNodeData,
  // VNode的子节点。
  children?: any,
  // children子节点规范化类型。
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
  // 处理作用域插槽
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  // 规范化 children 子节点。
  // 因为虚拟DOM是一个树形结构，每一个节点都应该是VNode类型，
  // 但是children参数又是任意类型的，
  // 所以如果有子节点，我们需要把它进行规范化成VNode类型
  // 相等说明是用户传递的 render 始终规范化
  if (normalizationType === ALWAYS_NORMALIZE) {
    // 处理children，不管用户传入数组/原始值，最终返回一维数组
    children = normalizeChildren(children)
    // 编译生成的 render，简单规范化
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    // 多维数组降低一个维度
    // 处理children，把二维数组转换为一维数组 用 concat + apply 来拍平数组
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
    // !data 这种情况就是没有给组件传递 props/event ，仅使用了组件。 <SonComponent />
    // !data.pre 这种情况是使用组件并传递了 props/event ，并且没有使用 v-pre 指令。 <SonComponent :text="text" @click="handleClick" />
    // 也就是说不管有没有传递 data，组件都会进入这里。
    // 而这里的分支则是 template 中使用组件，编译生成的 render
    // pre -> vue 自带指令 v-pre https://cn.vuejs.org/v2/api/#v-pre
    // 跳过这个元素和它的子元素的编译过程。可以用来显示原始 Mustache 标签（显示插值表达式）。跳过大量没有指令的节点会加快编译。
    } else if (
      (!data || !data.pre)
      && isDef(Ctor = resolveAsset(context.$options, 'components', tag))
    ) {
      // component
      // tag 是字符串，但不是保留标签，是组件名，创建自定义组件
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // 既不是保留标签，也不是组件
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      // 这里之所以直接创建未知标签的 VNode 而不是报错，
      // 这是因为子节点在 createElement 的过程中，
      // 有可能父节点会为其提供一个 namespace，
      // 真正做未知标签校验的过程发生在 patch 阶段。
      // 创建 vnode
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // tag 不是字符串，直接给 h函数(createElement) 传递了组件，用户手写 render 并传递组件对象
    // new Vue({
    //     render: h => h(App)
    // }).$mount("#app");
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
