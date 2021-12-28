// 发布订阅模式的事件中心
class EventCenter {
  constructor() {
    // 建立事件的键值对映射，可能会有同个事件key注册多个事件回调，所以需要使用数组当值
    this.sub = {}
  }
  // 注册事件
  $on(event, handler) {
    this.sub[event] = this.sub[event] || []
    this.sub[event].push(handler)
  }
  // 监听事件
  $emit(event, args) {
    this.sub[event].forEach(handler => {
      handler(args)
    })
  }
}

const ec = new EventCenter()

ec.$on('click', a => console.log(a))
ec.$on('click', a => console.log(a))

ec.$emit('click', 'hello world')
