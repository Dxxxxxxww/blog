/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'
/**
 * 通过 id 获取 dom 的 innerHTML
 * 通过调用 cached 缓存并返回一个函数
 * cached 方法在 shared/util.js 中
 */
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

// 先将在 ./runtime/index 中定义的 $mount 缓存起来
const mount = Vue.prototype.$mount
/**
 * 注册包含编译的$mount方法
 * 模板编译相关处理
 * 最终结果是将 template 转换为 render，再进行 mount
 */
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 获取 el 对应的 dom 对象
  el = el && query(el)

  /* istanbul ignore if */
  // el 不能是 body 和 html，如果是则报错
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }
  // 获取当前 vm 上的实例选项
  const options = this.$options
  // resolve template/el and convert to render function
  // render 的优先级比 template 要高，如果有 render 直接进行 mount 操作
  if (!options.render) {
    let template = options.template
    // 判断是否有 template
    if (template) {
      // 如果 template 是字符串
      if (typeof template === 'string') {
        // 如果 template 是 id 选择器
        if (template.charAt(0) === '#') {
          // 通过 id 获取 dom 的 innerHTML
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
        // 如果已经是字符串模板了，那就不需要处理，因为本来就是要获取字符串形式的html
      } else if (template.nodeType) {
        // 如果 template 是 dom 节点，直接取其 innerHTML
        // 如果是非元素节点的 dom 节点，例如文本节点，则其 innerHTML 为 undefined
        // 所以下面会额外再去判断一下 template
        template = template.innerHTML
      } else {
        // 都不满足则报错且返回 Vue 实例
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 如果没有 template 则使用 el 的 outerHTML 作为 template
      /*
        <div id="d">
          <p>Content</p>
          <p>Further Elaborated</p>
        </div>
        const d = document.getElementById("d");
        console.log(d.outerHTML); // '<div id="d"><p>Content</p><p>Further Elaborated</p></div>'
      */
      template = getOuterHTML(el)
    }
    // 这里判断 template 是否存在是因为上面的操作产生的 template 可能会不存在
    // template 如果存在将其转为 render
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      // 将 template 转为 render
      // staticRenderFns 优化时有用处
      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== 'production',
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments,
        },
        this
      )
      // options 上挂载 render
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  // 执行缓存的 mount
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    // 这里返回的事 outerHTML
    return el.outerHTML
  } else {
    // 没有 outerHTML 则说明可能是个文本节点/注释节点等等
    // 所以这里创建一个元素节点包裹起来
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    // 但是这里要注意，这里返回了包裹器的 innerHTML 也就是还是文本节点
    // 问题？这里为什么不返回 container.outerHTML 莫非转化成 render 中回去获取它的 parents ？
    return container.innerHTML
  }
}
// 挂载 compile 函数
Vue.compile = compileToFunctions

export default Vue
