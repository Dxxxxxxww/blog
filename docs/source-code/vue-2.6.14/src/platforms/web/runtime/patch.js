/* @flow */
// dom 操作相关函数
import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
// 处理指令和 ref的
/**
 * ref, 钩子函数，create，update，destroy
 * directives 钩子函数，create，update，destroy
 */
import baseModules from 'core/vdom/modules/index'
// web 平台相关模块
/**
 * attrs, 钩子函数，create，update
 * klass, 钩子函数，create，update
 * events, 钩子函数，create，update，处理 dom 原生事件
 * domProps, 钩子函数，create，update
 * style, 钩子函数，create，update
 * transition 钩子函数，create，activate, remove
 */
import platformModules from 'web/runtime/modules/index'

// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)
// modules：节点的属性、样式、事件的操作
// nodeOps：dom 操作
// createPatchFunction 是一个科里化的函数，先处理平台相关参数，这样返回的 patch 只需要处理自身的参数
export const patch: Function = createPatchFunction({ nodeOps, modules })
