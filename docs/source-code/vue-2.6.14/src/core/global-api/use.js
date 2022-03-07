/* @flow */

import { toArray } from '../util/index'

/**
 * 初始化 Vue.use
 */
export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    // 这里的 this 指向 Vue 构造函数
    // _installedPlugins 插件是否已经注册的标记
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    // 如果插件已经注册了则返回
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // 注册插件
    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    // 传入的plugin是对象
    if (typeof plugin.install === 'function') {
      // 改变 this，这里就是 plugin 对象本身
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      // 传入的plugin是函数
      // 改变 this，这里取 null，作为普通函数调用
      plugin.apply(null, args)
    }
    // 改变插件标记
    installedPlugins.push(plugin)
    return this
  }
}
