import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    // 判断是否是通过 new 来调用。可以作为一种 js 里限制函数只能通过 new 来调用的手段
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  // _uid: 设置实例唯一标识，初始为0
  // _isVue：设置 vue 实例标识，跳过 observe 响应式处理数据
  // mergeOptions：合并选项
  // _renderProxy：初始化 _renderProxy
  // 调用其他 init 方法。
  // initLifecycle，initEvents，initRender，
  // callHook(vm, 'beforeCreate')
  // initInjections，initState，initProvide
  // callHook(vm, 'created')
  this._init(options)
}
// 以下函数均将结果在 Vue.prototype 上挂载
// 初始化 _init 函数，挂载到 Vue.prototype 上 这个函数不是初始化 Vue.mixin 的 initMixin 函数。需要区分开来
initMixin(Vue)
// 初始化状态相关函数 $data,$props,$set(),$delete(),$watch() 全部都是和响应式相关的
stateMixin(Vue)
// 初始化事件相关函数 $on(),$once(),$off(),$emit()
// $on/$off 可以传入事件数组，为多个事件绑定/解绑相同的事件处理函数
eventsMixin(Vue)
// 初始化生命周期相关函数_update(),$forceUpdate(),$destroy()
lifecycleMixin(Vue)
// 初始化渲染相关函数 $nextTick(),_render() 调用 installRenderHelpers 注册一些编译时使用的工具函数，在 render 中使用
renderMixin(Vue)

export default Vue
