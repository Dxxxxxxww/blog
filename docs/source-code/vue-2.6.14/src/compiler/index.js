/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.
// 'createCompilerCreator'允许创建使用 alternative 的编译器
// 解析器/优化器/codegen，例如 SSR 优化编译器。
// 这里我们只导出一个默认的编译器，使用默认的部分。
export const createCompiler = createCompilerCreator(
  // 模板编译的核心函数
  function baseCompile (
    template: string,
    // 用户 options 和 baseOptions 合并后的 options
    options: CompilerOptions
  ): CompiledResult {
    // 1. 把模板编译成 ast
    const ast = parse(template.trim(), options)
    if (options.optimize !== false) {
      // 2. 优化 ast，标记ast及其子节点的静态节点和静态根节点
      optimize(ast, options)
    }
    // 3. 将 ast 转换成字符串形式的 js 代码。本质上就是将ast里面的属性提取出来，放到字符串中拼接。
    const code = generate(ast, options)
    return {
      ast,
      // 这里的 render 只是个字符串形式的 js 代码，还需要在 compileToFunctions 进行转换
      render: code.render,
      // 这里的 staticRenderFns 只是静态根节点的字符串形式的 js 代码，还需要在 compileToFunctions 进行转换
      staticRenderFns: code.staticRenderFns
    }
  }
)
