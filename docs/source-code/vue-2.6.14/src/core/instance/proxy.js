/* not type checking this file because flow doesn't play well with Proxy */

import config from 'core/config'
import { warn, makeMap, isNative } from '../util/index'

/**
 * 设置渲染代理对象，如果当前运行环境有 Proxy 类，则使用 Proxy
 * 如果没有，则使用本身(Vue实例)
 */
let initProxy

if (process.env.NODE_ENV !== 'production') {
  // 判断是否使用了保留关键字
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt,' +
    'require' // for Webpack/Browserify
  )
  // template 上使用了未定义的变量报错
  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      'referenced during render. Make sure that this property is reactive, ' +
      'either in the data option, or for class-based components, by ' +
      'initializing the property. ' +
      'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
      target
    )
  }
  // 不能定义带 $ 或者 _ 开头的变量
  const warnReservedPrefix = (target, key) => {
    warn(
      `Property "${key}" must be accessed with "$data.${key}" because ` +
      'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
      'prevent conflicts with Vue internals. ' +
      'See: https://vuejs.org/v2/api/#data',
      target
    )
  }

  const hasProxy =
    typeof Proxy !== 'undefined' && isNative(Proxy)

  if (hasProxy) {
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact')
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
          return false
        } else {
          target[key] = value
          return true
        }
      }
    })
  }

  const hasHandler = {
    // target：vm
    // with 触发 in 触发
    has (target, key) {
      const has = key in target
      const isAllowed = allowedGlobals(key) ||
        (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data))
      // 在渲染阶段对不合法的数据做判断和处理
      if (!has && !isAllowed) {
        if (key in target.$data) warnReservedPrefix(target, key)
        else warnNonPresent(target, key)
      }
      return has || !isAllowed
    }
  }

  const getHandler = {
    // target：vm
    // proxy. 触发
    get (target, key) {
      // 在渲染阶段对不合法的数据做判断和处理
      if (typeof key === 'string' && !(key in target)) {
        if (key in target.$data) {
          warnReservedPrefix(target, key)
        } else {
          warnNonPresent(target, key)
        }
      }
      return target[key]
    }
  }
  /**
   * 设置渲染代理对象，如果当前运行环境有 Proxy 类，则使用 Proxy 生成代理对象
   * 如果没有，则使用本身(Vue实例)
   */
  initProxy = function initProxy (vm) {
    // 判断当前环境是否支持 Proxy
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options
      // getHandler hasHandle
      // 模板生成的 render 函数执行时，会使用 hasHandler 去判断当前vm实例上是否有 _c _v _s 等等辅助函数
      // 以及data，props，computed 等等在 render(template) 中使用的数据
      // 当使用vue-loader解析.vue文件时，这个时候options.render._withStripped为真值
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      // 如果当前环境有 Proxy，则生成代理对象
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      // 否则将代理对象设置为本身
      vm._renderProxy = vm
    }
  }
}

export { initProxy }
