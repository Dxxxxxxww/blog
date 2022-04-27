---
sidebar: auto
---

# 手写一个简单的 vue

```js
// 手写简易版 vue
// 目标：1. 接收创建vue实例的参数
//      2. 将通过 data Object.defineProperty 处理，并挂载到实例上
//      3. 数据劫持，将 data 进行响应式处理，监听数据变化
//      4. 使用 Compiler 处理插值表达式

class Vue {
  constructor(opts) {
    // 保存传入的数据
    this.$options = opts
    this.$data = opts.data
    this.$el =
      typeof opts.el === 'string' ? document.querySelector(opts.el) : opts.el
    // 将 data 代理到 this 上，方便访问
    this.proxyData()
    // 数据劫持，设置 get 和 set 能在数据获取和改变时做更多的事情，配合观察者模式做响应式处理
    new Observable(this.$data)
    // 处理模板编译
    new Compiler(this)
  }

  proxyData() {
    Object.keys(this.$data).forEach((key) => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return this.$data[key]
        },
        set(newVal) {
          if (this.$data[key] === newVal) {
            return
          }
          this.$data[key] = newVal
        }
      })
    })
  }
}
/**
 * 响应式处理
 */
class Observable {
  constructor(data) {
    this.walk(data)
  }

  walk(data) {
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach((key) => {
      this.defineProperty(data, key, data[key])
    })
  }
  // 实参 value 保留在 get 中，形成了闭包，不会被回收
  defineProperty(data, key, value) {
    // 如果 value 是对象则需要深度处理响应式
    this.walk(value)
    // 每一个属性都有自己的 dep 对象来收集所有的观察者
    const dep = new Dep()
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 在访问值时将访问的观察者加入到依赖中
        // Dep.target 是当前的 watcher 实例
        Dep.target && dep.addSubs(Dep.target)
        // 不使用 data[key] 避免死循环
        return value
      },
      set: (newVal) => {
        if (newVal === value) {
          return
        }
        // Object.defineProperty 的特性，给 value 赋值就行，
        // 关键在于 Object.defineProperty 是对对象进行操作，里面的操作都是针对对象的，所以这里的改变会影响到对象本身，这点不需要纠结，
        // 跟基本类型修改没有关系
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty  关键词：bValue
        value = newVal
        // console.log(data[key])
        // 这样不行，会死循环
        // data[key] = newVal
        // 新值需要判断下是不是对象，如果是对象需要重新进行响应式
        this.walk(value)
        // 当值改变时需要通知观察者做出相应的处理
        dep.notify()
      }
    })
  }
}

const ELEMENT_NODE = 1
const TEXT_NODE = 3
/**
 * dom 处理
 */

class Compiler {
  constructor(vm) {
    this.vm = vm
    this.el = vm.$el
    this.compile(this.el)
  }
  // 编译模板，处理 dom 节点
  compile(el) {
    Array.from(el.childNodes).forEach((node) => {
      // 处理第一层子节点
      if (this.isElementNode(node)) {
        this.compileElement(node)
      } else if (this.isTextNode(node)) {
        this.compileText(node)
      }
      // 如果子节点还有子节点，则递归
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 判断是否为元素节点
  isElementNode(node) {
    return node.nodeType === ELEMENT_NODE
  }
  // 判断是否为文本节点
  isTextNode(node) {
    return node.nodeType === TEXT_NODE
  }
  // 判断是否为自定义指令
  isDirective(attr) {
    return attr.startsWith('v-')
  }
  // 处理文本节点
  compileText(node) {
    const reg = /\{\{(.+?)\}\}/
    let val = node.textContent
    if (reg.test(val)) {
      let key
      // 初始化时的操作，这里不能删除的
      node.textContent = val.replace(reg, (_, $1) => {
        key = $1.trim()
        return this.vm[key]
      })
      // 只是这里增加了数据改变时响应式的处理，上面原本的代码是不能删除的
      const watcher = new Watcher(this.vm, key, (newVal) => {
        node.textContent = newVal
      })
    }
  }
  // 处理元素节点，处理属性
  compileElement(node) {
    Array.from(node.attributes).forEach((attr) => {
      let attrName = attr.name
      if (this.isDirective(attrName)) {
        // v-text => text
        attrName = attrName.slice(2)
        const key = attr.value
        // 不使用 if 判断，那样太麻烦了，使用策略模式
        this.update(node, key, attrName)
      }
    })
  }
  // node: dom节点, key: vue 属性, prefix: 相应的函数名前缀
  update(node, key, prefix) {
    const fn = this[prefix + 'Update']
    // 判断是否有对应的方法，没有就不执行
    // 使用 call 确保 this 指向
    fn && fn.call(this, node, key, this.vm[key])
  }
  // v-text
  textUpdate(node, key, text) {
    // 初始化时的操作，这里不能删除的
    node.textContent = text
    // 只是这里增加了数据改变时响应式的处理，上面原本的代码是不能删除的
    const watcher = new Watcher(this.vm, key, (newVal) => {
      node.textContent = newVal
    })
  }
  // v-model
  modelUpdate(node, key, value) {
    // 初始化时的操作，这里不能删除的
    node.value = value
    // 只是这里增加了数据改变时响应式的处理，上面原本的代码是不能删除的
    const watcher = new Watcher(this.vm, key, (newVal) => {
      node.value = newVal
    })

    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }
}

class Dep {
  constructor() {
    // 观察者列表
    this.subs = []
  }
  addSubs(watcher) {
    // 判断是否是正确的观察者，如果是就加到观察者列表中
    if (watcher && watcher.update) {
      this.subs.push(watcher)
    }
  }
  notify() {
    this.subs.forEach((w) => {
      w.update()
    })
  }
}
// 什么时候创建 Watcher 实例呢？
// 在数据变化导致 dom 改变的地方，也就是需要触发 cb 的地方 ==》 compiler
class Watcher {
  constructor(vm, key, cb) {
    // 获取当前 vue 实例，用于获取数据
    this.vm = vm
    // 获取当前 watcher 监听的 key ，用于获取数据
    this.key = key
    // 当监听的数据发生变化时需要做的处理
    this.cb = cb
    // 将当前实例存到 Dep 上
    Dep.target = this
    // 缓存旧值，在 get 中，dep 保存当前实例
    this.oldVal = this.vm[this.key]
    // 置空，防止重复添加依赖
    Dep.target = null
  }

  update() {
    const newVal = this.vm[this.key]
    // 判断下新旧值是否相同，如果相同就不处理
    if (newVal === this.oldVal) {
      return
    }
    this.cb(newVal)
  }
}
```

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
  </head>
  <body>
    <div id="app">
      <div>{{ count }}</div>
      <div v-text="msg"></div>
      <div>
        <input v-model="count" />
      </div>
    </div>
    <!-- <script src="./test.js"></script> -->
    <script src="./test2.js"></script>
    <!-- <script src="./write.js"></script> -->
    <script>
      window.vm = new Vue({
        el: '#app',
        data: {
          msg: 'hello vue',
          count: 100
        }
      })
      // console.log(vm)
      // vm.count = { a: 'a' }
      // console.log(vm)
    </script>
  </body>
</html>
```

# 手写 router

## 第二版，不需要 mixin

```js
export default class VueRouter {
  // install 的 options 就不模拟了
  static install(Vue) {
    // 查看是否注册了，如果注册了就不重复注册
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 将 Vue 保存在全局变量
    _Vue = Vue
  }
  constructor(options) {
    // 保存 options
    this.options = options
    // 路由组件映射
    this.routeMap = {}
    // 响应式 path 对象
    this.data = _Vue.observable({
      current: '/'
    })
    // 初始化
    this.init()
    // 将 router 实例保存在 Vue 全局，这样也可以，并不需要用 mixin
    if (_Vue.prototype.$router) {
      return
    }
    _Vue.prototype.$router = this
  }
  init() {
    this.initRouteMap()
    this.initComponent()
    this.initEvent()
  }
  initRouteMap() {
    this.options.routes.forEach((route) => {
      this.routeMap[route.path] = route.component
    })
  }
  initComponent() {
    _Vue.component('router-link', {
      props: {
        to: String
      },
      methods: {
        handleClick(e) {
          e.preventDefault()
          // 改变浏览器的地址栏
          history.pushState({}, '', this.to)
          // 通过Vue上的全局路有实例进行路由跳转
          this.$router.data.current = this.to
        }
      },
      render(h) {
        return h(
          'a',
          {
            attrs: {
              href: this.to
            },
            on: {
              click: this.handleClick
            }
          },
          [this.$slots.default]
        )
      }
    })

    _Vue.component('router-view', {
      render: (h) => {
        const component = this.routeMap[this.data.current]
        return h(component)
      }
    })
  }
  initEvent() {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
}
```

## history 模式

```js
// 研究router.js可知以下几点
// 1. VueRouter 是一个类
// 2. Vue.use 使用插件时，如果参数是函数，则为 install 函数，如果是对象，则需要有 install 方法。由于我们使用类来实现，所以需要在类上实现一个静态方法

let _Vue

export default class MyVueRouter {
  static install = (Vue) => {
    // 1. 判断当前 router 插件是否已经安装
    if (MyVueRouter.install.installed) {
      return
    }
    MyVueRouter.install.installed = true
    // 2. 把 Vue 构造函数记录到全局。创建路由组件时需要用到
    _Vue = Vue
    // 3. 静态方法中的 this 不是 vue 实例，所以通过使用 Vue.mixin 获取 this 把创建 vue 实例时传入的 router 实例对象注入到所有 vue 实例上。this.$router就是通过这种方式才能在所有组件中使用。 ???
    _Vue.mixin({
      // 获取在 app.js 中创建根实例的属性
      beforeCreate() {
        // 只有跟实例才会传入 router
        if (this.$options.router) {
          _Vue.prototype.$router = this.$options.router
          // init 在 install 里或者是在 constructor 调用无所谓
          this.$options.router.init()
        }
      }
    })
  }
  // 构造函数，初始化 data routerMap，options 三个属性
  constructor(options) {
    this.options = options
    // 路由地址与组件映射
    this.routerMap = {}
    // data 是响应式的，在地址改变时要切换对应组件
    // 将当前路径处理成响应式对象，vue 内部会监听到 data 的变化从而使用对应的组件
    this.data = _Vue.observable({
      current: '/'
    })
  }

  init() {
    this.initRouterMap()
    this.initComponents()
    this.initEvent()
  }
  // 初始化路由映射，将地址和组件关联
  initRouterMap() {
    // 将创建router时 options 里传入的 routes 转换为地址与组件的映射
    this.options.routes.forEach((route) => {
      this.routerMap[route.path] = route.component
    })
  }
  // 初始化 router-link, router-view 组件
  initComponents() {
    _Vue.component('router-link', {
      props: {
        to: String
      },
      methods: {
        handleClick(e) {
          // 改变地址栏及向历史数据中添加数据，这里的 this 是组件
          history.pushState({}, '', this.to)
          // 因为 $router 已经挂载到 vue 全局，所以这里可以通过组件对象来改变 current
          this.$router.data.current = this.to
          // 阻止 a 标签默认事件，阻止浏览器向后端请求，将路由放在前端处理
          e.preventDefault()
        }
      },
      // 这里使用了 template，所以需要使用带编译版本的 vue
      // template: `<a :href="to"><slot></slot></a>`
      // 使用不带编译版本的vue
      render(h) {
        return h(
          'a',
          {
            attrs: {
              // history 模式，这里不需要拼接 #
              href: this.to
            },
            on: {
              click: this.handleClick
            }
          },
          [this.$slots.default]
        )
      }
    })
    // router-view 组件就是一个占位符，给真正需要渲染的组件占位
    _Vue.component('router-view', {
      // 使用箭头函数确保能拿到正确的 this，vue 实例
      render: (h) => {
        const component = this.routerMap[this.data.current]
        return h(component)
      }
    })
  }
  // 浏览器前进后退按钮
  initEvent() {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
}
```

## hash 模式

```js
let _Vue;
export default class VueRouter {
    constructor(opts) {
        // 路由组件映射
        this.routeMap = {};
        // 路由
        this.routes = opts.routes;
        // 当前路由
        this.data = _Vue.observable({
            current: "#/",
        });
        this.init();
    }

    static install(Vue) {
        if (VueRouter.install.installed) {
            return;
        }
        VueRouter.install.installed = true;
        _Vue = Vue;
    }
    init() {
        this.initRouteMap();
        this.initComponent();
        this.initEvent();
    }
    initRouteMap() {
        let path;
        this.routes.forEach((route) => {
            path = this.getHashPath(route.path);
            this.routeMap[path] = route.component;
        });
    }
    initComponent() {
        const that = this;
        _Vue.component("router-link", {
            props: {
                to: String,
            },
            methods: {
                handleClick(e) {
                    e.preventDefault();
                    const path = that.getHashPath(this.to);
                    location.hash = path;
                    that.data.current = path;
                },
            },
            render(h) {
                return h(
                    "a",
                    {
                        href: this.to,
                        on: {
                            click: this.handleClick,
                        },
                    },
                    [this.$slots.default]
                );
            },
        });

        _Vue.component("router-view", {
            render(h) {
                const component = that.routeMap[that.data.current];
                return h(component);
            },
        });
    }
    initEvent() {
        window.addEventListener("hashchange", (e) => {
            console.log(location.hash);
            this.data.current = location.hash;
        });
    }
    getHashPath(path) {
        return "#" + path;
    }
}
```

## 手写简单的 vuex

@[code](./code/vuex.js)
