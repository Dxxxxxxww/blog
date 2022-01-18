// day 5
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(callback) {
    this.state = PENDING
    this.value = ''
    this.reason = ''
    this.handleSuccess = []
    this.handleFail = []
    return callback(this.resolve, this.reject)
  }

  static resolve(val) {
    if (value instanceof MyPromise) {
      return val
    }
    return new MyPromise((resolve) => resolve(val))
  }

  static all(arr) {
    return new MyPromise((resolve, reject) => {
      const res = []
      const len = arr.length
      let index = 0
      const addItem = (k, v) => {
        res[k] = v
        // 先自增再跟长度判断
        index++
        // 等所有值都有了再改变状态
        if (index === len) {
          resolve(res)
        }
      }

      for (let i = 0; i < len; i++) {
        const current = array[i]
        if (current instanceof MyPromise) {
          current.then((value) => addItem(i, value), reject)
        } else {
          addItem(i, current)
        }
      }
    })
  }

  // flag
  resolve = (val) => {
    if (this.state !== PENDING) {
      return
    }
    this.state = FULFILLED
    this.value = val
    while (this.handleSuccess.length) {
      this.handleSuccess.shift()()
    }
  }
  reject = (reason) => {
    if (this.state !== PENDING) {
      return
    }
    this.state = REJECTED
    this.reason = reason
    while (this.handleFail.length) {
      this.handleFail.shift()()
    }
  }
  then(success, fail) {
    if (!isFunc(success)) {
      success = (value) => value
    }
    if (!isFunc(fail)) {
      fail = (reason) => {
        throw reason
      }
    }
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        // 通过宏任务来拿到 promise2
        setTimeout(() => {
          try {
            const res = success(this.value)
            resolvePromise(promise2, res, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else if (this.state === REJECTED) {
        setTimeout(() => {
          try {
            const err = fail(this.reason)
            resolvePromise(promise2, err, resolve, reject)
          } catch (error) {
            reject(error)
          }
        }, 0)
      } else {
        this.handleSuccess.push(() => {
          setTimeout(() => {
            try {
              const res = success(this.value)
              resolvePromise(promise2, res, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
        this.handleFail.push(() => {
          setTimeout(() => {
            try {
              const err = fail(this.reason)
              resolvePromise(promise2, err, resolve, reject)
            } catch (error) {
              reject(error)
            }
          }, 0)
        })
      }
    })
    return promise2
  }
  catch(fail) {
    return this.then(undefined, fail)
  }
  finally(callback) {
    return this.then(
      (val) => {
        return MyPromise.resolve(callback()).then(
          () => val,
          (err) => {
            throw err
          }
        )
      },
      (error) => {
        return MyPromise.resolve(callback()).then(
          () => error,
          (err) => {
            throw err
          }
        )
      }
    )
  }
}

const resolvePromise = (promise, res, resolve, reject) => {
  // 如果是 promise 实例
  if (res instanceof MyPromise) {
    if (promise === res) {
      return reject(
        new TypeError('死循环, Chaining cycle detected for promise')
      )
    }
    // 如果返回值是个 promise 需要传递其状态
    return res.then(resolve, reject)
  }
  // 如果不是 promise 实例，直接 resolve
  resolve(res)
}

const isFunc = (val) =>
  Object.prototype.toString.call(val).slice(8, 16) === 'Function'

// day 4

let _Vue
class VueRouter {
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
              click: handleClick
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

// day 3
// vue-router
let _Vue
class VueRouter {
  static install(Vue) {
    // 判断是否已经注册
    if (VueRouter.install.installed) {
      return
    }
    VueRouter.install.installed = true
    // 保存 Vue 到全局变量
    _Vue = Vue
    // 将 router 实例挂载到 prototype 上
    // 需要获取this实例，所以通过全局混入拿到根实例上的 $router
    Vue.mixin({
      beforeCreate() {
        // 根实例
        if (this.$options.router) {
          Vue.prototype.$router = this.$options.router
        }
      }
    })
  }
  constructor(options) {
    this.options = options
    this.routeMap = {}
    // 将当前路径处理成响应式对象，vue 内部会监听到 data 的变化从而使用对应的组件
    this.data = _Vue.observable({ current: '/' })
    this.init()
  }
  init() {
    this.initRouteMap()
    this.initComponent()
    this.initEventListener()
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
          // 改变地址栏地址
          history.pushState(this.to)
          // 改变响应式的 data 使 vue 更改组件
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

    const that = this
    _Vue.component('router-view', {
      render(h) {
        const component = that.routeMap[that.data.current]
        return h(component)
      }
    })
  }
  initEventListener() {
    window.addEventListener('popstate', () => {
      this.data.current = window.location.pathname
    })
  }
}

// day 2
// 观察者模式

class Dep {
  constructor() {
    this.subs = []
  }
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
  constructor(cb) {
    this.cb = cb
  }
  update() {
    this.cb()
  }
}

const dep = new Dep()
const watcher = new Watcher(() => {
  console.log('hello')
})
dep.addSubs(watcher)
dep.notify()

// 发布订阅模式

class EventCenter {
  constructor() {
    this.map = {}
  }
  $on(eventName, cb) {
    if (!this.map[eventName]) {
      // 同一个事件肯定会有多个订阅者，所以需要使用 list
      this.map[eventName] = [cb]
    } else {
      this.map[eventName].push(cb)
    }
  }
  $emit(eventName, args) {
    this.map[eventName].forEach((event) => {
      event(args)
    })
  }
}
const ec = new EventCenter()
ec.$on('click', () => {
  console.log('hello')
})
ec.$on('click', () => {
  console.log('world')
})

ec.$emit('click')
