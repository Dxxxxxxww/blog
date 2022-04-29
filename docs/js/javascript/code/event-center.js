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
    this.center[event].push({
      handler: _handler,
      id: this.stringify(_handler)
    })
    this.on(event, handler)
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
    this.center[event]?.forEach((eventObj) => {
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
  console.log('keyup c')
}

function d() {
  console.log('keyup d')
}

ec.once('keyup', c)
ec.once('keyup', d)

ec.trigger('click')
ec.trigger('keyup')
console.log('before off ----')
ec.off('click', b)

ec.trigger('click')
ec.trigger('keyup')
