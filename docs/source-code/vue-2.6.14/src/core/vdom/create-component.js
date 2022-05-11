/* @flow */

import VNode from './vnode'
import { resolveConstructorOptions } from 'core/instance/init'
import { queueActivatedComponent } from 'core/observer/scheduler'
import { createFunctionalComponent } from './create-functional-component'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isObject
} from '../util/index'

import {
  resolveAsyncComponent,
  createAsyncPlaceholder,
  extractPropsFromVNodeData
} from './helpers/index'

import {
  callHook,
  activeInstance,
  updateChildComponent,
  activateChildComponent,
  deactivateChildComponent
} from '../instance/lifecycle'

import {
  isRecyclableComponent,
  renderRecyclableComponentTemplate
} from 'weex/runtime/recycle-list/render-component-template'

// inline hooks to be invoked on component VNodes during patch
// 内部的钩子 hooks 会在 组件vnode patch 期间调用
// snabbdom 中一共有 pre、init、create、insert、prepatch、update、postpatch、destroy、remove、post
// vue 重写了 init、prepatch、insert、destroy
// 组件 vnode 钩子函数
const componentVNodeHooks = {
  // 在 patch 时调用
  init(vnode: VNodeWithData, hydrating: boolean): ?boolean {
    if (
      vnode.componentInstance &&
      !vnode.componentInstance._isDestroyed &&
      // keepAlive 的情况
      vnode.data.keepAlive
    ) {
      // kept-alive components, treat as a patch
      const mountedNode: any = vnode // work around flow
      componentVNodeHooks.prepatch(mountedNode, mountedNode)
    } else {
      // 创建组件实例
      const child = (vnode.componentInstance = createComponentInstanceForVnode(
        vnode,
        // 激活的实例，它其实就是当前组件对象的父组件对象
        activeInstance
      ))
      // 挂载组件
      // 需要注意的是，在 patch 的 createComponent 中，hydrating 传 false，所以不会在这里挂载，
      // 而是在 createComponent 中直接通过 insert 来挂载到页面上。
      // 这里的 $mount 实际上是为了
      // 组件真实 vnode.elm 挂载是在 patch/createComponent 里的 insert中，插入到父组件的 html 中
      child.$mount(hydrating ? vnode.elm : undefined, hydrating)
    }
  },

  prepatch(oldVnode: MountedComponentVNode, vnode: MountedComponentVNode) {
    const options = vnode.componentOptions
    const child = (vnode.componentInstance = oldVnode.componentInstance)
    updateChildComponent(
      child,
      options.propsData, // updated props
      options.listeners, // updated listeners
      vnode, // new parent vnode
      options.children // new children
    )
  },
  // 组件 vnode insert 钩子函数的主要作用就是触发组件的 mounted 生命周期钩子
  // insert 是在 patch 的最后通过 invokeInsertHook 触发
  insert(vnode: MountedComponentVNode) {
    const { context, componentInstance } = vnode
    if (!componentInstance._isMounted) {
      componentInstance._isMounted = true
      // 调用组件的 mounted 生命周期钩子函数
      callHook(componentInstance, 'mounted')
    }
    if (vnode.data.keepAlive) {
      if (context._isMounted) {
        // vue-router#1212
        // During updates, a kept-alive component's child components may
        // change, so directly walking the tree here may call activated hooks
        // on incorrect children. Instead we push them into a queue which will
        // be processed after the whole patch process ended.
        queueActivatedComponent(componentInstance)
      } else {
        activateChildComponent(componentInstance, true /* direct */)
      }
    }
  },

  destroy(vnode: MountedComponentVNode) {
    const { componentInstance } = vnode
    if (!componentInstance._isDestroyed) {
      // 不是 keep-alive
      if (!vnode.data.keepAlive) {
        // 调用实例的 $destroy
        componentInstance.$destroy()
      } else {
        // 是 keep-alive 的话，调用 deactivated 生命周期钩子函数
        deactivateChildComponent(componentInstance, true /* direct */)
      }
    }
  },
}

const hooksToMerge = Object.keys(componentVNodeHooks)

// createComponent 主要做三件事情
// 1. 构造子类构造函数
// 2. 安装组件钩子函数
// 3. 创建并返回 vnode
export function createComponent (
  Ctor: Class<Component> | Function | Object | void,
  // 就是 h 函数的第二个对象参数
  data: ?VNodeData,
  context: Component,
  children: ?Array<VNode>,
  tag?: string
): VNode | Array<VNode> | void {
  if (isUndef(Ctor)) {
    return
  }
  // 拿到基本构造函数，也就是 Vue 的构造函数。$options._base 赋值过程是在 initGlobalAPI 函数执行的过程中赋值的
  // 因为在 _init 中进行了 mergeOptions 进行配置合并，所以这里可以使用 $options 来获取
  const baseCtor = context.$options._base

  // 1. 构造子类构造函数
  // plain options object: turn it into a constructor
  // 我们组件导出的都是一个对象。但是实际上传递过来的对象上的参数要比我们写组件的要多。
  // 这是因为 vue-loader 在处理.vue 文件的时候默认帮我们做了一些处理
  if (isObject(Ctor)) {
    // 使用 Vue.extend 来创建组件的构造函数
    // Vue.extend 在initGlobalAPI方法中调用initExtend时被定义的
    Ctor = baseCtor.extend(Ctor)
  }

  // if at this stage it's not a constructor or an async component factory,
  // reject.
  // 组件检验相关 非重点
  if (typeof Ctor !== 'function') {
    if (process.env.NODE_ENV !== 'production') {
      warn(`Invalid Component definition: ${String(Ctor)}`, context)
    }
    return
  }

  // async component
  // 异步组件相关 非重点
  let asyncFactory
  // 如果没有 cid 则认为是异步组件，每个组件在使用时，都会进行 extend，在 extend 时就会增加 cid 属性。
  if (isUndef(Ctor.cid)) {
    asyncFactory = Ctor
    Ctor = resolveAsyncComponent(asyncFactory, baseCtor)
    if (Ctor === undefined) {
      // return a placeholder node for async component, which is rendered
      // as a comment node but preserves all the raw information for the node.
      // the information will be used for async server-rendering and hydration.
      return createAsyncPlaceholder(
        asyncFactory,
        data,
        context,
        children,
        tag
      )
    }
  }

  data = data || {}

  // resolve constructor options in case global mixins are applied after
  // component constructor creation
  // 在组件构造函数创建后合并全局mixin选项和组件自身选项
  resolveConstructorOptions(Ctor)

  // transform component v-model data into props & events
  // 处理组件上的 v-model 指令
  if (isDef(data.model)) {
    transformModel(Ctor.options, data)
  }

  // extract props
  // 获取 prosData 相关 非重点
  const propsData = extractPropsFromVNodeData(data, Ctor, tag)

  // functional component
  // 函数组件相关 非重点
  if (isTrue(Ctor.options.functional)) {
    return createFunctionalComponent(Ctor, propsData, data, context, children)
  }
  // 事件监听处理
  // extract listeners, since these needs to be treated as
  // child component listeners instead of DOM listeners
  const listeners = data.on
  // replace with listeners with .native modifier
  // so it gets processed during parent component patch.
  data.on = data.nativeOn

  if (isTrue(Ctor.options.abstract)) {
    // abstract components do not keep anything
    // other than props & listeners & slot

    // work around flow
    const slot = data.slot
    data = {}
    if (slot) {
      data.slot = slot
    }
  }
  // 2. 安装组件钩子函数
  // install component management hooks onto the placeholder node
  // 安装组件钩子函数。init/prepatch/insert/destroy
  // Vue 中的虚拟DOM 借鉴了开源库 snabbdom 的实现，
  // 这个库里面有一些 vnode节点 在处于不同的场景下，提供了对应的钩子函数来方便我们处理相关的逻辑
  // 在 init 钩子中会创建组件实例。
  installComponentHooks(data)

  // return a placeholder vnode
  const name = Ctor.options.name || tag
  // 3. 创建并返回 vnode
  // 组件vnode 的 children 是 undefined，也就是说组件VNode没有children子节点
  // 创建组件 vnode 对象
  const vnode = new VNode(
    `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`,
    data, undefined, undefined, undefined, context,
    // 在 patch 时，在 init 钩子函数中，会通过 vnode.componentOptions.Ctor 来实例化组件
    { Ctor, propsData, listeners, tag, children },
    asyncFactory
  )
  // weex 相关 非重点
  // Weex specific: invoke recycle-list optimized @render function for
  // extracting cell-slot template.
  // https://github.com/Hanks10100/weex-native-directive/tree/master/component
  /* istanbul ignore if */
  if (__WEEX__ && isRecyclableComponent(vnode)) {
    return renderRecyclableComponentTemplate(vnode)
  }

  return vnode
}

export function createComponentInstanceForVnode (
  // we know it's MountedComponentVNode but flow doesn't
  vnode: any,
  // activeInstance in lifecycle state
  parent: any
): Component {
  // 组件内部选项
  const options: InternalComponentOptions = {
    // 标记当前是组件
    _isComponent: true,
    // 在 createComponent 中创建的 vnode，它是占位的 vnode，也就是组件真实 vnode 的父 vnode
    // `vue-component-${Ctor.cid}${name ? `-${name}` : ''}`
    _parentVnode: vnode,
    // activeInstance 也就是当前组件对象的父组件对象，一个 Vue 的实例
    // 对于 App.vue 来说，它的 parent 就是 main.js 里的 new Vue() 实例
    parent
  }
  // check inline-template render functions
  const inlineTemplate = vnode.data.inlineTemplate
  if (isDef(inlineTemplate)) {
    options.render = inlineTemplate.render
    options.staticRenderFns = inlineTemplate.staticRenderFns
  }
  // 调用组件构造函数来创建组件实例
  return new vnode.componentOptions.Ctor(options)
}
// 安装组件 vnode 钩子函数。Vue 中的虚拟DOM 借鉴了开源库 snabbdom 的实现，
// 这个库里面有一些 vnode节点 在处于不同的场景下，提供了对应的钩子函数来方便我们处理相关的逻辑。
// snabbdom 中一共有 pre、init、create、insert、prepatch、update、postpatch、destroy、remove、post
// vue 重写了 init、prepatch、insert、destroy 会在这里进行合并。
// 其他的钩子函数会在其他地方合并，由于不是重点，不再详细的进行分析
function installComponentHooks (data: VNodeData) {
  // vue 生命周期钩子不存在 hook 中
  // data 由于是从 createElement 中传递过来，也就是 h 函数的第二个参数，
  // 所以 data.hook 有可能包含用户传入的钩子，
  // 如果用户传入了钩子，会被合并到一个函数中与内置钩子一起调用。
  // 一定得是钩子名的，不然你传个 a,b,c 也是不会在源码中去调用的。
  const hooks = data.hook || (data.hook = {})
  for (let i = 0; i < hooksToMerge.length; i++) {
    const key = hooksToMerge[i]
    const existing = hooks[key]
    const toMerge = componentVNodeHooks[key]
    if (existing !== toMerge && !(existing && existing._merged)) {
      // 重复的会通过 mergeHook 来合并钩子
      hooks[key] = existing ? mergeHook(toMerge, existing) : toMerge
    }
  }
}

function mergeHook (f1: any, f2: any): Function {
  const merged = (a, b) => {
    // flow complains about extra args which is why we use any
    f1(a, b)
    f2(a, b)
  }
  merged._merged = true
  return merged
}

// transform component v-model info (value and callback) into
// prop and event handler respectively.
function transformModel (options, data: any) {
  const prop = (options.model && options.model.prop) || 'value'
  const event = (options.model && options.model.event) || 'input'
  ;(data.attrs || (data.attrs = {}))[prop] = data.model.value
  const on = data.on || (data.on = {})
  const existing = on[event]
  const callback = data.model.callback
  if (isDef(existing)) {
    if (
      Array.isArray(existing)
        ? existing.indexOf(callback) === -1
        : existing !== callback
    ) {
      on[event] = [callback].concat(existing)
    }
  } else {
    on[event] = callback
  }
}
