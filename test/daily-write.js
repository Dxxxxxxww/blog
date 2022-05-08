// day 14
class EventCenter {
  center = {}
  on(event, handler) {
    if (!this.center[event]) {
      this.center[event] = []
    }
    this.center[event].push({
      handler,
      id: this.stringify(handler)
    })
  }
  once(event, handler) {
    if (!this.center[event]) {
      this.center[event] = []
    }
    const _handler = () => {
      handler()
      this.off(event, handler)
    }
    // 这里不能使用 $on 因为这里的 id 取的不是 _handler 的 id，而是 handler
    this.center[event].push({
      handler: _handler,
      id: this.stringify(handler)
    })
    // this.on(event, handler)
  }
  off(event, handler) {
    const eventList = this.center[event]
    const id = this.stringify(handler)

    if (!!eventList) {
      const index = eventList.findIndex((eventObj) => eventObj.id === id)
      eventList.splice(index, 1)
    }
  }
  clear(event) {
    this.center[event] = []
  }
  trigger(event) {
    // 拷贝一份，防止 once 中的函数处理完直接 off 了，导致 数组长度变了，循环出问题。
    const eventList = this.center[event]?.slice() ?? []
    eventList.forEach((eventObj) => {
      // console.log(this.center[event].length)
      eventObj.handler()
    })
  }
  stringify(handler) {
    return handler.toString()
  }
}

const ec = new EventCenter()
ec.on('click', () => {
  console.log('click a')
})
function b() {
  console.log('click b')
}

ec.on('click', b)

const c = () => {
  console.log('once keyup c')
}

function d() {
  console.log('once keyup d')
}

ec.once('keyup', c)
ec.once('keyup', d)

ec.trigger('click')
ec.trigger('keyup')
console.log('after off ----')
ec.off('click', b)

ec.trigger('click')
ec.trigger('keyup')

// day 13
// 第一种
function add(...args1) {
  let totalArgs = args1
  function fn(...args2) {
    totalArgs = totalArgs.concat(args2)
    return fn
  }
  fn.valueOf = () => {
    return totalArgs.reduce((total, cur) => {
      return total + cur
    }, 0)
  }
  return fn
}

add(1)(2)(3).valueOf()

// 第二种，利用 bind 特性
function add() {
  const args = [...arguments]
  const fn = add.bind(this, ...args)
  fn.valueOf = () => {
    return args.reduce((total, cur) => {
      return total + cur
    }, 0)
  }
  return fn
}

// 实现一个公共的科里化函数，将普通函数转变成科里化函数
// add(1,2,3) == 6  const arr2 = curry(add)  add2(1)(2)(3)

function curry(func) {
  const argLength = func.length
  const args = Array.prototype.slice.call(arguments, 1)
  return function fn() {
    args.push(...arguments)
    if (args.length < argLength) {
      return fn
    }
    return func(...args)
  }
}

function add1(x, y, z) {
  return x + y + z
}

const add2 = curry(add1)
console.log(add2(1)(2)(3))
// day 12
// 实现 arrange('William').wait(5).do('commit').wait(5).do('push').execute()
class Arrange {
  tasks = []
  constructor(name) {
    this.tasks.push(() => {
      console.log(`hi, this is ${name}`)
    })
  }
  wait(time) {
    this.tasks.push(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            console.log(`wake up after ${time}s`)
            resolve()
          }, time * 1e3)
        })
    )
    return this
  }
  do(action) {
    this.tasks.push(() => {
      console.log(`do ${action}`)
    })
    return this
  }
  async execute() {
    while (!!this.tasks.length) {
      const task = this.tasks.shift()
      task && (await task())
    }
  }
}

const arrange = (name) => new Arrange(name)

arrange('William').wait(3).do('commit').wait(3).do('push').execute()

// day 11 promise 1
const { log } = console
class _LazyMan {
  tasks = []
  constructor(name) {
    this.tasks.push(() => log(`Hi, this is ${name}`))
    setTimeout(async () => {
      while (!!this.tasks.length) {
        await this.tasks.shift()()
      }
    }, 0)
  }
  sleep(time) {
    this._sleepWrapper(time)
    return this
  }
  sleepFirst(time) {
    this._sleepWrapper(time, true)
    return this
  }
  eat(food) {
    this.tasks.push(() => log(`eat ${food}`))
    return this
  }

  _sleepWrapper(time, flag) {
    new Promise((resolve) => {
      setTimeout(() => {
        const fn = () => {
          log(`wake up after ${time}s`)
        }
        if (flag) {
          this.tasks.unshift(fn)
        } else {
          this.tasks.push(fn)
        }
        resolve()
      }, time * 1e3)
    })
  }
}

function LazyMan(name) {
  return new _LazyMan(name)
}
LazyMan('hank').sleep(3).eat('cola').sleepFirst(1)

// day 10 手写科里化4
function add(...args) {
  const func = add.bind(null, ...args)
  func.toString = () => args.reduce((prev, next) => (prev += next), 0)
  return func
}
// day 9 手写科里化3
function add() {
  const _args = [...arguments]
  function fn() {
    _args.push(...arguments)
    return fn
  }
  fn.valueOf = function () {
    return _args.reduce((sum, cur) => sum + cur)
  }
  return fn
}

// day 8 手写科里化2
function curry(fn) {
  return function curriedFn(...args) {
    if (args.length < fn.length) {
      return function () {
        // 这里一定要注意还需要递归调用 curriedFn，而不是 fn
        // 因为后续传参也不一定全部传完了
        return curriedFn.apply(this, args.concat(Array.from(arguments)))
      }
    }
    return fn.apply(this, args)
  }
}

// day 7 手写科里化1
function curry(func) {
  return function curriedFn(...args) {
    if (args.length < func.length) {
      return function () {
        return curriedFn(...args.concat(Array.from(arguments)))
      }
    }
    return func(...args)
  }
}

// day 6 手写 new
function myNew(ctor) {
  const obj = Object.create(ctor.prototype)
  const res = ctor.apply(obj, Array.prototype.slice.call(arguments, 1))
  return typeof res === 'object' || typeof res === 'function' ? res : obj
}

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
