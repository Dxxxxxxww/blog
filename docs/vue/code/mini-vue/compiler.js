class Compiler {
  constructor(vm) {
    this.vm = vm
    this.compile(vm.$el)
  }
  compile(el) {
    let childNodes = el.childNodes
    childNodes = Array.from(childNodes)
    childNodes.forEach((node) => {
      //  元素节点
      if (node.nodeType === 1) {
        this.compileElement(node)
      } else if (node.nodeType === 3) {
        // 文本节点
        this.compileText(node)
      }
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
    // while (el.childNodes && el.childNodes.length) {
    //   let childNodes = el.childNodes
    //   childNodes = Array.from(childNodes)
    //   childNodes.forEach((node) => {
    //     //  元素节点
    //     if (node.nodeType === 1) {
    //       this.compileElement(node)
    //     } else if (node.nodeType === 3) {
    //       // 文本节点
    //       this.compileText(node)
    //     }
    //   })
    // }
  }
  compileElement(node) {
    const attrs = node.attributes
    if (attrs && attrs.length) {
      Array.from(attrs).forEach((attr) => {
        if (this.isDirective(attr.name)) {
          const directive = attr.name.slice(2)
          const key = attr.value
          this.update(node, key, directive)
        }
      })
    }
  }
  update(node, key, type) {
    const fn = () => this[`${type}Update`] && this[`${type}Update`](node, key)
    fn()
  }
  textUpdate(node, key) {
    // 设置文本内容
    node.textContent = this.vm[key]
    new Watcher(this.vm, key, (newVal) => {
      node.textContent = newVal
    })
  }
  modelUpdate(node, key) {
    node.value = this.vm[key]
    new Watcher(this.vm, key, (newVal) => {
      node.value = newVal
    })
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  compileText(node) {
    const reg = /\{\{\s*(.+?)\s*\}\}/
    const str = node.textContent
    if (reg.test(str)) {
      const key = str.replace(reg, (_, $1) => {
        return $1
      })
      node.textContent = this.vm[key]
      console.log(node.textContent)
      new Watcher(this.vm, key, (newVal) => {
        node.textContent = newVal
      })
    }
  }
  isDirective(str) {
    return str.startsWith('v-')
  }
}
