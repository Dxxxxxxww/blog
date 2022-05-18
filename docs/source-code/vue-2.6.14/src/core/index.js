import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'
// 初始化
// Vue 静态 api，Vue.set，Vue.delete，Vue.nextTick，Vue.observable，Vue.use，Vue.mixin，Vue.extend，Vue.component, directive, filter
// Vue 静态属性，Vue.util，Vue.options，Vue.components，Vue.directives，Vue.filters，
// 设置 keep-alive 组件
initGlobalAPI(Vue)
// ssr相关
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})
// ssr相关
Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})
// ssr相关
// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue
