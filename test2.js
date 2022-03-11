class Vue {
  constructor(options) {
    // 保存数据
    this.$options = options
    this.$data = options.data
    this.$methods = options.methods
    this.$el =
      typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el
    // 代理到 this 上
    this.proxyData(this.$data)
    this.proxyData(this.$methods)
    // 响应式处理，响应式要配合模板编译才是真正的数据驱动
    new Observable(this.$data)
    // 模板编译
    new Compiler(this)
  }

  proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return data[key]
        },
        set(newVal) {
          if (newVal === data[key]) {
            return
          }
          data[key] = newVal
        }
      })
    })
  }
}
// 数据劫持，设置 get 和 set 能在数据获取和改变时做更多的事情，配合观察者模式做响应式处理
class Observable {
  constructor(data) {
    this.walk(data)
  }
  // 遍历对象属性
  walk(data) {
    // 判断下 data 是否合法
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach((key) => {
      this.defineReactive(data, key, data[key])
    })
  }
  // 定义响应式，什么是响应式？获取/改变值时可以做一些事情
  // 这里必须传递 value, 否则在 get/set 中使用 data[key] 会导致死循环
  defineReactive(data, key, value) {
    // value 有可能还是个对象，如果是对象，需要深度遍历
    this.walk(value)
    // 每个键都是被观察对象
    const dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 访问属性时，添加对应的观察者
        Dep.target && dep.addSubs(Dep.target)
        return value
      },
      set: (newVal) => {
        if (newVal === value) {
          return
        }
        value = newVal
        // debugger
        // 这里需要使用箭头函数保证 this 指向 Observable 的实例
        // 如果新值是对象，也需要深度遍历
        this.walk(value)
        dep.notify()
      }
    })
  }
}

const ELEMENT_TYPE = 1
const TEXT_TYPE = 3
class Compiler {
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el
    this.compiler(this.el)
  }

  compiler(el) {
    // 遍历标签
    Array.from(el.childNodes).forEach((node) => {
      // 判断是元素节点还是文本节点
      if (this.isElementNode(node)) {
        this.compilerElement(node)
      } else if (this.isTextNode(node)) {
        this.compilerText(node)
      }

      if (node.childNodes && node.childNodes.length) {
        this.compiler(node)
      }
    })
  }

  isElementNode(node) {
    return node.nodeType === ELEMENT_TYPE
  }

  isTextNode(node) {
    return node.nodeType === TEXT_TYPE
  }

  update(node, attr, key) {
    const fn = this[attr + 'Update']
    // 确保 this 指向
    if (attr.includes(':')) {
      const event = attr.split(':')[1]
      this.onUpdate(node, key, event, this.vm[key].bind(this.vm))
      return
    }
    fn && fn.call(this, node, key, this.vm[key])
  }
  // v-text
  textUpdate(node, key, text) {
    node.textContent = text
    new Watcher(this.vm, key, (newVal) => {
      node.textContent = newVal
    })
  }
  // v-html
  htmlUpdate(node, key, html) {
    node.innerHTML = html
    // 只是这里增加了数据改变时响应式的处理，上面原本的代码是不能删除的
    const watcher = new Watcher(this.vm, key, (newVal) => {
      node.innerHTML = newVal
    })
  }
  // v-on
  onUpdate(node, key, event, cb) {
    console.log(event)
    node.addEventListener(event, cb)
    const watcher = new Watcher(this.vm, key, (newVal) => {
      node.addEventListener(event, cb)
    })
  }
  // v-model
  modelUpdate(node, key, value) {
    node.value = value
    new Watcher(this.vm, key, (newVal) => {
      node.value = newVal
    })
    // v-model 双向绑定
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
  // 编译元素节点
  compilerElement(node) {
    Array.from(node.attributes).forEach((attr) => {
      let attrName = attr.name
      if (attrName.startsWith('v-')) {
        attrName = attrName.slice(2)
        this.update(node, attrName, attr.value)
      }
    })
  }
  // 编译文本节点
  compilerText(node) {
    const reg = /\{\{(.+?)\}\}/
    const val = node.textContent
    if (!reg.test(val)) {
      return
    }
    let key
    // 修改模板数据
    node.textContent = val.replace(reg, (_, $1) => {
      key = $1.trim()
      return this.vm[key]
    })

    new Watcher(this.vm, key, (newVal) => {
      node.textContent = newVal
    })
  }
}

// 通过观察者模式来让 dom 自动更新
// 被观察对象
class Dep {
  constructor() {
    this.subs = []
  }
  // 收集观察者
  addSubs(watcher) {
    if (!watcher || !watcher.update) {
      return
    }
    this.subs.push(watcher)
  }

  notify() {
    this.subs.forEach((watcher) => {
      watcher.update()
    })
  }
}

class Watcher {
  constructor(vm, key, cb) {
    // vue 实例
    this.vm = vm
    // 观察对象
    this.key = key
    // 观察者需要执行的方法
    this.cb = cb
    // 将观察者保存在被观察者上
    Dep.target = this
    // 保存旧值，并且触发 get，将实例存入被观察者对象的list中
    this.oldVal = this.vm[key]
    // 清除，防止重复添加
    Dep.target = null
  }

  update() {
    const currentVal = this.vm[this.key]
    if (this.oldVal === currentVal) {
      return
    }
    this.cb(currentVal)
  }
}
