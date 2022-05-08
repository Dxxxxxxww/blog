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
