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
