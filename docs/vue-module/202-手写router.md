# 手写 router

## hash 模式

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
