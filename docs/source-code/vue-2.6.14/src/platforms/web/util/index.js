/* @flow */

import { warn } from 'core/util/index'

export * from './attrs'
export * from './class'
export * from './element'

/**
 * Query an element selector if it's not an element already.
 * 返回el对应的dom元素
 */
export function query (el: string | Element): Element {
  // 如果 el 是 字符串，则将其当做选择器处理
  if (typeof el === 'string') {
    const selected = document.querySelector(el)
    if (!selected) {
      process.env.NODE_ENV !== 'production' && warn(
        'Cannot find element: ' + el
      )
      return document.createElement('div')
    }
    return selected
  } else {
    // 如果不是字符串，直接当做dom元素返回
    return el
  }
}
