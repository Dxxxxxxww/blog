/* @flow */

import { extend } from 'shared/util'
import { detectErrors } from './error-detector'
import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  // baseOptions：平台相关的 options
  // src/platforms/web/compiler/options.js 中定义
  return function createCompiler (baseOptions: CompilerOptions) {
    // 接受两个参数：模板，用户传递的选项。
    // 用户传递的选项 会与平台相关的 options 合并，最终传给 baseCompile
    // compile 主要做两件事：1. 合并选项；2. 调用编译
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // 用原型链来进行兜底，这样在自身上找不到属性就会去原型链上找了。并且如果有重名的属性/方法不会覆盖
      const finalOptions = Object.create(baseOptions)
      const errors = []
      const tips = []
      // 保存编译时的提示/报错
      let warn = (msg, range, tip) => {
        (tip ? tips : errors).push(msg)
      }
      // 如果有用户传入的 options，进行选项合并
      if (options) {
        if (process.env.NODE_ENV !== 'production' && options.outputSourceRange) {
          // $flow-disable-line
          const leadingSpaceLength = template.match(/^\s*/)[0].length

          warn = (msg, range, tip) => {
            const data: WarningMessage = { msg }
            if (range) {
              if (range.start != null) {
                data.start = range.start + leadingSpaceLength
              }
              if (range.end != null) {
                data.end = range.end + leadingSpaceLength
              }
            }
            (tip ? tips : errors).push(data)
          }
        }
        // merge custom modules
        // 合并自定义模块，使用 concat 来拍平数组
        if (options.modules) {
          finalOptions.modules =
            (baseOptions.modules || []).concat(options.modules)
        }
        // merge custom directives
        // 合并自定义指令
        if (options.directives) {
          finalOptions.directives = extend(
            // 同样也是用原型链来兜底，
            Object.create(baseOptions.directives || null),
            options.directives
          )
        }
        // copy other options
        // 拷贝其他属性/方法
        for (const key in options) {
          if (key !== 'modules' && key !== 'directives') {
            finalOptions[key] = options[key]
          }
        }
      }

      finalOptions.warn = warn
      // 调用编译，这里的 options 是合并后的 options
      const compiled = baseCompile(template.trim(), finalOptions)
      if (process.env.NODE_ENV !== 'production') {
        detectErrors(compiled.ast, warn)
      }
      compiled.errors = errors
      compiled.tips = tips
      return compiled
    }

    return {
      compile,
      // 模板编译的入口
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}
