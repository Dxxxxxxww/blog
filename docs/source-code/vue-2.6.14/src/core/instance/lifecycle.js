/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import { mark, measure } from '../util/perf'
import { createEmptyVNode } from '../vdom/vnode'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'
import { toggleObserving } from '../observer/index'
import { pushTarget, popTarget } from '../observer/dep'

import {
  warn,
  noop,
  remove,
  emptyObject,
  validateProp,
  invokeWithErrorHandling
} from '../util/index'

export let activeInstance: any = null
export let isUpdatingChildComponent: boolean = false

// 每次组件 patch，都会执行该函数，都会重新生成闭包变量 prevActiveInstance。
// 这样一来，每个组件的祖级都不会被覆盖，也不需要用 list 来存储整个"族谱"
export function setActiveInstance(vm: Component) {
  const prevActiveInstance = activeInstance
  activeInstance = vm
  return () => {
    activeInstance = prevActiveInstance
  }
}

export function initLifecycle (vm: Component) {
  const options = vm.$options

  // locate first non-abstract parent
  // 获取当前组件的父组件实例/Vue 实例
  let parent = options.parent
  // 建立父子关系
  // 找到当前实例的父级，将当前实例添加到其子列表中
  // 找到当前组件的父组件，将当前组件添加到父组件的子组件列表中
  // 抽象组件不建立父子关系
  if (parent && !options.abstract) {
    // 如果父组件是抽象组件则继续网上找，找到非抽象组件，建立父子关系
    while (parent.$options.abstract && parent.$parent) {
      parent = parent.$parent
    }
    // 把当前组件推到父组件的子组件列表中
    parent.$children.push(vm)
  }
  // 保存父组件
  vm.$parent = parent
  // main.js 里的 new Vue()，根实例
  vm.$root = parent ? parent.$root : vm
  // 用于保存子组件实例
  vm.$children = []
  vm.$refs = {}
  // 挂载实例私有属性
  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin (Vue: Class<Component>) {
  // 会在组件渲染的时候调用
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    const prevEl = vm.$el
    // 上一次处理的 vnode
    const prevVnode = vm._vnode
    // 保存当前激活的实例
    // 我们知道组件渲染(挂载)是一个递归的过程，渲染顺序是先子后父。
    // 那么在这种递归渲染(挂载)的过程中，
    // 由于父组件先创建，我们先保存了父组件实例到 activeInstance 中，
    // 这样在子组件渲染(挂载) 就可以通过 activeInstance 获取到 父组件实例。
    // 每一个组件其实都相当于是一个单向链表，保留着对父级的引用，区别在于，组件还会保存着祖父级的引用
    const restoreActiveInstance = setActiveInstance(vm)
    // 将当前的真实 vnode 保存到 vm._vnode 上，用于下次更新
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // __patch__ 在入口(src/platforms/runtime/index.js)被注入。
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      // 首次渲染
      // vm.$el 真实dom节点
      // 把 $el 转为 vnode 与 新的vnode 比较，将比较的结果生成真实dom返回给 vm.$el
      // 组件初次挂载时，vm.$el 还不存在
      // 组件进入到这里的逻辑是，父节点在 createElm 中通过 patch/createComponent 传入组件占位 vnode
      // 通过组件占位 vnode 上的 data.hook.init 来创建组件实例(注意，组件真实 vnode 上是不会有 data.hook 的，除非用户传入)，并执行 $mount
      // 然后到了 render 生成了组件真实 vnode，再 _update 到了这里。
      // 此时的 vm 是组件实例，vm._vnode 是组件真实 vnode， vm._vnode.parent 是组件占位 vnode
      // 经过了 patch 后，返回了组件的 $el，此时组件还没有挂载。
      // 这一系列创建组件实例的流程结束后，又回到了 init 钩子函数中，组件的真正挂载是在 init 中的 insert
      vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */)
    } else {
      // updates
      // 更新
      // 新旧 vnode 对比
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    // 还原成上一次激活的实例
    restoreActiveInstance()
    // update __vue__ reference
    if (prevEl) {
      prevEl.__vue__ = null
    }
    // 给 dom 元素上挂载一个 vue 的标记，表示这个元素是 vue 创建的
    if (vm.$el) {
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }

  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }
  // 组件销毁的过程，应该是从父组件开始，然后递归销毁子组件，当子组件都销毁完毕时，父组件基本完成了销毁动作。
  Vue.prototype.$destroy = function () {
    const vm: Component = this
    if (vm._isBeingDestroyed) {
      return
    }
    callHook(vm, 'beforeDestroy')
    vm._isBeingDestroyed = true
    // remove self from parent
    const parent = vm.$parent
    // 在父组件的 $children 移除自身
    // 非抽象组件
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    // teardown watchers
    // 移除自身依赖
    // 移除当前组件的 render watcher 观察者
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    // 移除所有观察者
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    // 触发子组件销毁动作，注意第二个传参是 null
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    // 移除事件监听
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      vm.$el.__vue__ = null
    }
    // release circular reference (#6759)
    if (vm.$vnode) {
      vm.$vnode.parent = null
    }
  }
}

export function mountComponent (
  vm: Component,
  el: ?Element,
  // 在 $mount 调用时传递
  hydrating?: boolean
): Component {
  // 使用传入的 el 挂载 $el
  // 根实例的 $el 就是在这里挂载的，组件的在 patch 中
  vm.$el = el
  // 如果没有传入 render
  if (!vm.$options.render) {
    // 创建一个空的虚拟dom对象
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      // 并且传入了 template 则会报警，只含运行时版本是不能编译 template
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  // 调用 beforeMount 生命周期钩子
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  // 开发环境并开启了性能能检测，则添加性能检测代码
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    // 赋值函数
    // _render() 返回虚拟dom
    // _update() 内部调用 patch() 会将虚拟dom -> 真实dom -> 更新到页面上
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }

  // we set this to vm._watcher inside the watcher's constructor
  // 在 Watcher 的构造函数中的，将 this(Watch实例) 设置到 vm._watcher 上。 vm._watcher = this
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // 因为 watcher 的初次 patch 可能会调用 $forceUpdate (例如 内部的子组件 mounted 钩子)，它依赖
  // vm._watcher 已经被定义
  // 创建一个 Watcher 实例 渲染watcher
  new Watcher(vm, updateComponent, noop, {
    // 调用 beforeUpdate 生命周期钩子
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // 手动挂载实例，自己调用 mounted
  // mounted is called for render-created child components in its inserted hook
  // 在它(子组件)的插入钩子中为渲染创建的子组件调用 mounted
  // 只有根实例才会满足这个条件，
  // 也就是说这里触发的是根实例的 mounted 方法，而不是组件的 mounted 方法。
  // 普通元素哪来的 mounted 方法...
  if (vm.$vnode == null) {
    vm._isMounted = true
    // 触发 mounted 生命周期钩子
    callHook(vm, 'mounted')
  }
  return vm
}

export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: MountedComponentVNode,
  renderChildren: ?Array<VNode>
) {
  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = true
  }

  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren.

  // check if there are dynamic scopedSlots (hand-written or compiled but with
  // dynamic slot names). Static scoped slots compiled from template has the
  // "$stable" marker.
  const newScopedSlots = parentVnode.data.scopedSlots
  const oldScopedSlots = vm.$scopedSlots
  const hasDynamicScopedSlot = !!(
    (newScopedSlots && !newScopedSlots.$stable) ||
    (oldScopedSlots !== emptyObject && !oldScopedSlots.$stable) ||
    (newScopedSlots && vm.$scopedSlots.$key !== newScopedSlots.$key) ||
    (!newScopedSlots && vm.$scopedSlots.$key)
  )

  // Any static slot children from the parent may have changed during parent's
  // update. Dynamic scoped slots may also have changed. In such cases, a forced
  // update is necessary to ensure correctness.
  const needsForceUpdate = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    hasDynamicScopedSlot
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render

  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // update $attrs and $listeners hash
  // these are also reactive so they may trigger child update if the child
  // used them during render
  vm.$attrs = parentVnode.data.attrs || emptyObject
  vm.$listeners = listeners || emptyObject

  // update props
  if (propsData && vm.$options.props) {
    toggleObserving(false)
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      const propOptions: any = vm.$options.props // wtf flow?
      props[key] = validateProp(key, propOptions, propsData, vm)
    }
    toggleObserving(true)
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }

  // update listeners
  listeners = listeners || emptyObject
  const oldListeners = vm.$options._parentListeners
  vm.$options._parentListeners = listeners
  updateComponentListeners(vm, listeners, oldListeners)

  // resolve slots + force update if has children
  if (needsForceUpdate) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }

  if (process.env.NODE_ENV !== 'production') {
    isUpdatingChildComponent = false
  }
}

function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}

export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}

export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}

export function callHook (vm: Component, hook: string) {
  // #7573 disable dep collection when invoking lifecycle hooks
  // 在调用生命周期钩子时禁用dep 收集
  // 所以这里不传参数，让 Dep.target = undefined 让 watcher 栈顶传入 undefined 达到不触发依赖收集的目的
  pushTarget()
  const handlers = vm.$options[hook]
  const info = `${hook} hook`
  if (handlers) {
    // 生命周期钩子在内部是以函数数组的形式存在 [Function]
    for (let i = 0, j = handlers.length; i < j; i++) {
      invokeWithErrorHandling(handlers[i], vm, null, vm, info)
    }
  }
  // 判断是否有监听生命周期钩子函数的，如果有就触发
  // 在 initEvents 中初始化，在 Vue.prototype.$on 中改为 true
  // this.$on('hook:destroyed', () => {
  //   window.removeEventListener('resize', listenResize)
  // })
  // 在template模板中，我们可以使用 @hook:xxx 的形式来监听子组件对应的生命周期，
  // 当对应的生命周期函数被触发的时候，会执行我们提供的回调函数，这种做法对于需要监听子组件某个生命周期的需求来说十分有用。
  // 在撰写Vue应用的时候，我们经常需要在created/mounted等生命周期中监听resize/scroll等事件，
  // 然后在beforeDestroy/destroyed生命周期中移除。对于这种需求，
  // 我们可以把逻辑写在同一个地方，而不是分散在两个生命周期中，这对于需要监听自身生命周期的需要来说也十分有用。
  if (vm._hasHookEvent) {
    vm.$emit('hook:' + hook)
  }
  popTarget()
}
