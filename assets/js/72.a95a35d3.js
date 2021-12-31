(window.webpackJsonp=window.webpackJsonp||[]).push([[72],{270:function(t,e,a){"use strict";a.r(e);var r=a(0),c=Object(r.a)({},(function(){var t=this,e=t.$createElement,a=t._self._c||e;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"vue-三种-watcher-详解"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#vue-三种-watcher-详解"}},[t._v("#")]),t._v(" vue 三种 watcher 详解")]),t._v(" "),a("h2",{attrs:{id:"一、这里我不打算展开讲细节，而是只讲重点的一些需要自己牢记的东西。"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#一、这里我不打算展开讲细节，而是只讲重点的一些需要自己牢记的东西。"}},[t._v("#")]),t._v(" 一、这里我不打算展开讲细节，而是只讲重点的一些需要自己牢记的东西。")]),t._v(" "),a("ol",[a("li",[t._v("render watcher")]),t._v(" "),a("li",[t._v("computed watcher")]),t._v(" "),a("li",[t._v("user watcher")])]),t._v(" "),a("h3",{attrs:{id:"render-watcher"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#render-watcher"}},[t._v("#")]),t._v(" render watcher")]),t._v(" "),a("ol",[a("li",[t._v("在 mountComponent 中，会将 updateComponent 作为 render watcher 的 getter，并且 isRenderWatcher 置为 true。")]),t._v(" "),a("li",[t._v("当执行 watcher 的 get 方法时，会订阅所有遇到的 props data computed watcher，并且相应的属性也会进行依赖收集（依赖收集并不会重复收集相同 id 的 watcher，这是因为存储 dep id 的数据结构是 set，只有不同 id 的 dep 才会被 watcher 订阅，才会触发依赖收集）。")]),t._v(" "),a("li",[t._v("这样一来，当 data 有变化触发 set 并调用 dep.notify() 时，就会循环调用 watcher 的 update。对于 render watcher 进入 queueWatcher 触发最终调用 run 重新渲染。")])]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("updateComponent")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  vm"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("_update")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("vm"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("_render")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" hydrating"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("h3",{attrs:{id:"computed-watcher"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#computed-watcher"}},[t._v("#")]),t._v(" computed watcher")]),t._v(" "),a("p",[t._v("当我们在 computed 选项中定义了一个 computed watcher 后，在 vue init 时，会调用 initComputed 来对 computed 选项进行一些配置操作。")]),t._v(" "),a("ol",[a("li",[t._v("首先，vue 会将用户所定义的所有 computed 创建成一个 computed watcher 并存储在一个 vm._computedWatchers 内部属性中。在进行 watcher 实例化时，会将 computed 的函数传递给 watcher 的 getter。将 lazy: true 选项传递给 watcher，这个属性会让 computed watcher 不立即调用 get 方法。")]),t._v(" "),a("li",[t._v("创建完 computed watcher 后，会在 vm 上定义 computed 对应的函数，这个函数也就是我们在使用 computed 属性时所真正调用的函数了。在这个函数中它会帮助我们去做 watcher 的计算（watcher.evaluate 中会调用 watcher 的 get 方法），以及进行依赖收集（computed 中会引用 data，所以 computed watcher 就会去订阅 data ，而 data 的 dep 也就会收集到 computed watcher）。")]),t._v(" "),a("li",[t._v("这样一来，当 data 有变化触发 set 并调用 dep.notify() 时，就会循环调用 watcher 的 update。对于 computed watcher 就会将 dirty 重新置为 true，让下次引用到 computed watcher 时，createComputedGetter 时可以重新执行计算(evaluate)。")])]),t._v(" "),a("hr"),t._v(" "),a("h3",{attrs:{id:"user-watcher"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#user-watcher"}},[t._v("#")]),t._v(" user watcher")]),t._v(" "),a("p",[t._v("user watcher 的话就会相对简单了。")]),t._v(" "),a("ol",[a("li",[t._v("通过 initWatch 来调用 createWatcher，进行一些格式化/规范化操作，最终调用 $watch。")]),t._v(" "),a("li",[t._v("在 $watch 中配置 user: true，然后创建 Watcher 实例，如果 user watcher 的 immediate 为 true，的话，则立即执行一次 user watcher 定义的函数。")]),t._v(" "),a("li",[t._v("与 render watcher 和 computed watcher 不同的是，user watcher 的 getter 在创建时被设置为字符串，所以会通过 parsePath 来返回一个函数充当 watcher 的 getter。")]),t._v(" "),a("li",[t._v("当调用 get 方法时，便会将当前的 user watcher 推入 watcher 栈中，然后调用 getter 去引用 watch 所监听的 data，这样便会触发 data 的依赖收集。")]),t._v(" "),a("li",[t._v("这样，当 data 变化时，派发的通知就能通知到 user watcher，在其 run 方法中触发 user watcher 的回调。")])])])}),[],!1,null,null,null);e.default=c.exports}}]);