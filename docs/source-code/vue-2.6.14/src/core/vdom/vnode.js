/* @flow */

// 文本节点，只有 text
// 注释节点，text + isComment === true
// 元素节点，tag、data、children、context
// 组件节点，tag、data、children、context、componentOptions、componentInstance
// 克隆节点 isCloned === true
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  // 保存当前vnode 的 dom元素
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  key: string | number | void;
  // 表示组件的 options 选项，占位 vnode 才会有
  componentOptions: VNodeComponentOptions | void;
  // 表示当前组件的实例，占位 vnode 才会有
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node

  // strictly internal
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: Function | void; // async component factory function 异步组件工厂函数
  asyncMeta: Object | void;
  isAsyncPlaceholder: boolean;
  ssrContext: Object | void;
  fnContext: Component | void; // real context vm for functional nodes
  fnOptions: ?ComponentOptions; // for SSR caching
  devtoolsMeta: ?Object; // used to store functional render context for devtools
  fnScopeId: ?string; // functional scope id support

  constructor (
    tag?: string,
    data?: VNodeData,
    // 创建组件 vnode 时，该值为 undefined
    children?: ?Array<VNode>,
    // 创建组件 vnode 时，该值为 undefined
    text?: string,
    // 创建组件 vnode 时，该值为 undefined
    elm?: Node,
    context?: Component,
    // 创建组件 vnode 时，会传递 { Ctor, propsData, listeners, tag, children }
    // 在 patch 时，在 init 钩子函数中，会通过 vnode.componentOptions.Ctor 来实例化组件
    componentOptions?: VNodeComponentOptions,
    asyncFactory?: Function
  ) {
    // 关键属性-------------------
    this.tag = tag
    this.data = data
    this.children = children
    this.text = text
    this.elm = elm
    // 关键属性-------------------
    this.ns = undefined
    this.context = context
    this.fnContext = undefined
    this.fnOptions = undefined
    this.fnScopeId = undefined
    // 关键属性-------------------
    this.key = data && data.key
    // 关键属性-------------------
    this.componentOptions = componentOptions
    this.componentInstance = undefined
    this.parent = undefined
    this.raw = false
    this.isStatic = false
    this.isRootInsert = true
    this.isComment = false
    this.isCloned = false
    this.isOnce = false
    this.asyncFactory = asyncFactory
    this.asyncMeta = undefined
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}

// 创建一个空的vnode节点-注释节点
export const createEmptyVNode = (text: string = '') => {
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}
// 创建一个文本vnode节点
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    // #7975
    // clone children array to avoid mutating original in case of cloning
    // a child.
    vnode.children && vnode.children.slice(),
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions,
    vnode.asyncFactory
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.fnContext = vnode.fnContext
  cloned.fnOptions = vnode.fnOptions
  cloned.fnScopeId = vnode.fnScopeId
  cloned.asyncMeta = vnode.asyncMeta
  cloned.isCloned = true
  return cloned
}
