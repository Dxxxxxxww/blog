/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  // 处理 类样式(class)，行内样式(style)，和 v-if 一起处理的 v-model
  modules,
  directives,
  // 是否是 pre 标签
  isPreTag,
  // 自闭合标签
  isUnaryTag,
  mustUseProp,
  canBeLeftOpenTag,
  // html 保留标签
  isReservedTag,
  getTagNamespace,
  staticKeys: genStaticKeys(modules)
}
