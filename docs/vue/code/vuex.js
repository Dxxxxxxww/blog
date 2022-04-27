// 第二版，不使用 mixin
let _Vue

class Store {
    constructor(options) {
        const {
            state = {},
            getters = {},
            mutations = {},
            actions = {},
        } = options
        // state 是响应式的
        this.state = _Vue.observable(state)
        // getters 需要接收 state
        this.getters = Object.create(null)
        Object.keys(getters).forEach(key => {
            Object.defineProperty(this.getters, key, {
                get: () => getters[key](state)
            })
        })
        // 定义私有属性
        this._mutations = mutations
        this._actions = actions
        // 挂载 $store
        _Vue.prototype.$store = this
    }

    commit(type, payload) {
        this._mutations[type](this.state, payload)
    }

    dispatch(type, payload) {
        this._actions[type](this, payload)
    }
}

function install(Vue) {
    _Vue = Vue
}

export {
    Store,
    install
}

// 第一版，需要用 mixin
// let _Vue
//
// class Store {
//   constructor(options) {
//     const { state = {}, getters = {}, mutations = {}, actions = {} } = options
//     // state 是响应式的，需要响应式处理
//     // 将参数挂载到 this 上，便于访问
//     this.state = _Vue.observable(state)
//     // getters 就是 处理/不处理 state，并返回值
//     // getters 给外部访问，不需要原型
//     this.getters = Object.create(null)
//     // getters 需要接收 state
//     Object.keys(getters).forEach((key) => {
//       Object.defineProperty(this.getters, key, {
//         get: () => getters[key](state)
//       })
//     })
//     // 私有属性
//     this._mutations = mutations
//     this._actions = actions
//   }
//
//   commit(type, payload) {
//       this._mutations[type](this.state, payload)
//   }
//
//   dispatch(type, payload) {
//       this._actions[type](this, payload)
//   }
// }
//
// function install(Vue) {
//   _Vue = Vue
//   _Vue.mixin({
//     beforeCreate() {
//       if (this.$options.store && !_Vue.prototype.$store) {
//         _Vue.prototype.$store = this.$options.store
//       }
//     }
//   })
// }
//
// export { Store, install }
