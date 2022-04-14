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
 *
 * 总结下：template 会有两种情况使用 innerHTML 获取模板，一个是传入 id选择器时，一个是传入标签时。如果以字符串形式传入标签，不会调用 innerHTML
 *        如果是以 el 来获取标签，会使用 outerHTML
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
      // template 取 innerHTML。 template 取 innerHTML 应该是为了组件中的根标签 都是 template
      // 如果 template 是字符串
      // 如果 template 是字符串形式，并且不是 id 选择器，就不做处理  `<h1 style="font-size: 12px;">{{ msg }}</h1>`
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
        // template 取 innerHTML 毋庸置疑，因为组件形式都是先写 template，然后在里面写单根节点，这才是组件的真正内容。这也应该是为什么 template 这个 vue 自带的组件是不会被渲染到页面上的原因。不带编译版本的就会在这里修改成 render。
        template = template.innerHTML
      } else {
        // 都不满足则报错且返回 Vue 实例
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // el 取 outerHTML 这是因为 el 是挂载的地方，即div#app。
      // 更新：调试完 template / render 之后，我发现应该不是为了保证挂载点不会被去除，因为挂载点本来就是要去除的
      // 这应该是为了保证比如说以前的老项目里想要使用 vue 了，给一个标签节点做根节点，这时候如果我们对 el 使用 innerHTML 的话，这个节点就会被替代掉，就会很奇怪。
      // 如果用 el 来生成 template，则必须使用 outerHTML，[来保证挂载的地方不会被去除(保证 #app 的元素存在)]
      // 可以去 examples/10-virtualdom 中的 1. 使用 el 来生成 render 的调试 来调试查看
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
      /**
       *
       * 在包含编译的版本下，当传入的是 template 时，会去走内部的编译逻辑。
       * 通过将 template 转换成 ast 语法树，再转换成字符串形式的 js 代码，
       * 最后通过 new Function() 来生成真正的 js 代码，也就是 render 函数。
       * 该 render 函数会通过编译时写入的 \_c 来获取 vnode。
       *
       * 所以，当我们手写 render 传入时，通过 h 来调用 createElement 。
       * 与编译生成的 render 函数内部使用 \_c 的本质是一样的。都是通过 createElement 来获取 vnode。
       */
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
