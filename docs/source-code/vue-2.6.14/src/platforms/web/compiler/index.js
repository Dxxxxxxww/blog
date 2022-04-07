/* @flow */

import { baseOptions } from './options'
// 与平台无关的编译函数
import { createCompiler } from 'compiler/index'
// baseOptions：平台相关的 options，web平台下包括对标签，样式，指令的处理
const { compile, compileToFunctions } = createCompiler(baseOptions)

export { compile, compileToFunctions }
