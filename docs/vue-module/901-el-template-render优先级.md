# el-template-render 优先级

## 一、代码

在 <code>entry-runtime-with-compiler.js</code> 中，我们可以发现如下代码：

```js
const mount = Vue.prototype.$mount
Vue.prototype.$mount = function(
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' &&
      warn(
        `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
      )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      const { render, staticRenderFns } = compileToFunctions(
        template,
        {
          outputSourceRange: process.env.NODE_ENV !== 'production',
          shouldDecodeNewlines,
          shouldDecodeNewlinesForHref,
          delimiters: options.delimiters,
          comments: options.comments
        },
        this
      )
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}
```

太长了不好看？没关系，我们截取其中的关键点

```js
if (!options.render) {
  let template = options.template
  if (template) {
    if (typeof template === 'string') {
      if (template.charAt(0) === '#') {
        template = idToTemplate(template)
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && !template) {
          warn(
            `Template element not found or is empty: ${options.template}`,
            this
          )
        }
      }
    } else if (template.nodeType) {
      template = template.innerHTML
    } else {
      if (process.env.NODE_ENV !== 'production') {
        warn('invalid template option:' + template, this)
      }
      return this
    }
  } else if (el) {
    template = getOuterHTML(el)
  }
  if (template) {
    // ……
  }
  return mount.call(this, el, hydrating)
}
```

从上面代码可以看出，当在调用 '带编译的 mount' 函数时， <code>render</code> 的优先级是最高的，其次是 <code>template</code> ，最后才是 <code>el</code> 。

这里也印证了 **官网-API-选项/DOM-el** 中的一段话：**如果 render 函数和 template property 都不存在，挂载 DOM 元素的 HTML 会被提取出来用作模板，此时，必须使用 Runtime + Compiler 构建的 Vue 库。**

对于不需要编译的版本而言，也就是 <code>entry-runtime.js</code> 中，<code>el</code> 或者说 <code>template</code> 已经被编译成 <code>render</code> 了，所以不存在优先级这个概念，关于编译这块我们放到下一章节来了解。
