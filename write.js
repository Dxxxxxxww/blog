// 手写简易版 vue
// 目标：1. 接收创建vue实例的参数
//      2. 将通过 data Object.defineProperty 处理，并挂载到实例上
//      3. 数据劫持，将 data 进行响应式处理，监听数据变化
//      4. 使用 compiler 处理插值表达式

class MyVue {
  constructor(options) {
    // 1. 保存传入的选项数据
    this.$options = options || {}
    this.$data = options.data || {}
    this.$el =
      typeof options.el === 'string'
        ? document.querySelector(options.el)
        : options.el
    // 2. 通过将 data Object.defineProperty 处理，并挂载到实例上
    this.proxyData()
    // 3. 数据劫持，将 data 进行响应式处理，监听数据变化
    new Observable(this.$data)
    // 4. 使用 compiler 处理插值表达式
  }

  proxyData() {
    Object.keys(this.$data).forEach((k) => {
      Object.defineProperty(this, k, {
        enumerable: true,
        configurable: true,
        get() {
          return this.$data[k]
        },
        set(newVal) {
          if (newVal === this.$data[k]) {
            return
          }
          this.$data[k] = newVal
        }
      })
    })
  }
}

class Observable {
  constructor(data) {
    this.walk(data)
  }
  // 遍历对象
  walk(data) {
    // 判断 data 是否存在或者是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    Object.keys(data).forEach((k) => {
      this.defineReactive(data, k, data[k])
    })
  }
  // 数据劫持，对数据做响应式处理
  // defineReactive 执行完，后续 this.$data 访问数据还能获取到 value 的原因是产生了闭包
  defineReactive(data, key, value) {
    // Object.defineProperty 在 this.$data 对应 key 上建立的 getter 中保留了形参 value
    // 导致 defineReactive 完后，value 形参不能被释放
    Object.defineProperty(data, key, {
      enumerable: true,
      configurable: true,
      get() {
        // 这里不能使用 data[key] 是因为会产生死循环 data[key] 会触发 get
        return value
      },
      set(newVal) {
        if (newVal === value) {
          return
        }
        value = newVal
        // 发送通知给处理函数
      }
    })
  }
}

window.vm = new MyVue({
  el: '#app',
  data: {
    msg: 'hello vue',
    count: 100
  }
})
