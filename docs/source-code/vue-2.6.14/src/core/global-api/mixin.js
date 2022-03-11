/* @flow */

import { mergeOptions } from '../util/index'

/**
 * 初始化 Vue.mixin，内部调用 mergeOptions
 */
export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    // 这里的 this 指向 Vue 构造函数
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}
