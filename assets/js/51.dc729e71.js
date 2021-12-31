(window.webpackJsonp=window.webpackJsonp||[]).push([[51],{254:function(t,a,s){"use strict";s.r(a);var v=s(0),r=Object(v.a)({},(function(){var t=this,a=t.$createElement,s=t._self._c||a;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"js-性能优化"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#js-性能优化"}},[t._v("#")]),t._v(" JS 性能优化")]),t._v(" "),s("p",[s("a",{attrs:{href:"https://jsbench.me/",target:"_blank",rel:"noopener noreferrer"}},[t._v("查看 js 性能优化的网站"),s("OutboundLink")],1)]),t._v(" "),s("h2",{attrs:{id:"内存管理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#内存管理"}},[t._v("#")]),t._v(" 内存管理")]),t._v(" "),s("h3",{attrs:{id:"内存介绍"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#内存介绍"}},[t._v("#")]),t._v(" 内存介绍")]),t._v(" "),s("p",[t._v("内存：由读写单元组成，表示一片可操作的空间。")]),t._v(" "),s("p",[t._v("进程：是 cpu 资源分配的最小单位，系统会给它分配内存。")]),t._v(" "),s("p",[t._v("线程：是 cpu 调度的最小单位")]),t._v(" "),s("h2",{attrs:{id:"js-垃圾回收"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#js-垃圾回收"}},[t._v("#")]),t._v(" js 垃圾回收")]),t._v(" "),s("p",[t._v("当一片内存空间没有变量引用，变成不可达到的空间时，就会被 js 进行垃圾回收。")]),t._v(" "),s("h3",{attrs:{id:"常见-gc-算法"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#常见-gc-算法"}},[t._v("#")]),t._v(" 常见 GC 算法")]),t._v(" "),s("ol",[s("li",[t._v("引用计数，通过数字来判断是否需要回收；")]),t._v(" "),s("li",[t._v("可达性分析算法：标记清除，给正在使用的对象(空间)打上标记，来判断是否需要回收；")]),t._v(" "),s("li",[t._v("标记整理，与标记清除类似，只不过在回收时有差异；")]),t._v(" "),s("li",[t._v("分代回收，V8。")])]),t._v(" "),s("h4",{attrs:{id:"引用计数原理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#引用计数原理"}},[t._v("#")]),t._v(" 引用计数原理")]),t._v(" "),s("p",[t._v("通过引用计数器，设置引用数，如果为 0 表示没有引用，则可以进行回收。"),s("b",[t._v("核心是引用数是否为 0。")])]),t._v(" "),s("p",[t._v("优点：")]),t._v(" "),s("ol",[s("li",[t._v("发现垃圾时立即回收；")]),t._v(" "),s("li",[t._v("最大限度减少程序暂停。由于引用计数器一直监视着引用为 0 的对象，所以当内存即将到达瓶颈时，就会立即回收这些对象，减少程序暂停的频率。")])]),t._v(" "),s("p",[t._v("缺点：")]),t._v(" "),s("ol",[s("li",[t._v("无法回收循环引用的对象；")])]),t._v(" "),s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("fn")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" obj1 "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n        obj2 "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    obj1"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("next "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" obj2"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n    obj2"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("prev "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" obj1"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),s("ol",{attrs:{start:"2"}},[s("li",[t._v("时间开销大。引用计数器的存在，需要时刻监视对象的引用计数是否需要更改，并且修改引用数值也需要耗时，对象越多，需要的操作也越多，时间开销越大。")])]),t._v(" "),s("h4",{attrs:{id:"标记清除"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#标记清除"}},[t._v("#")]),t._v(" 标记清除")]),t._v(" "),s("p",[t._v("标记清除会分为两个阶段，标记和清除。\n从 GC Roots(全局) 出发，在标记阶段，会遍历所有对象，给活动的对象打上标记(标记为可达)。在清除阶段，会遍历所有对象，回收没有标记的对象(不可达的对象)，并且会将上一步打上的标记抹除，便于下次工作。")]),t._v(" "),s("p",[t._v("如何解决循环引用？")]),t._v(" "),s("p",[s("img",{attrs:{src:"/performance/bjqc.png",alt:"image"}})]),t._v(" "),s("p",[t._v("如图，当两个对象除了彼此引用外，在一个作用域链上，在 GC Roots(全局) 向下搜索无法达到这两个对象时，这两个对象就可以被回收。"),s("b",[t._v("所以标记清除的核心是 GC Roots(全局) 是否可达对象。")])]),t._v(" "),s("p",[t._v("如何判断一个对象是否是可达的呢？")]),t._v(" "),s("p",[t._v("比如说当函数 sayHi 在执行时，sayHi 在执行栈中存在，全局就有这个函数的引用，内部的变量自然是可以达到的。而当 sayHi 执行完出栈后，全局就无法达到内部的变量了。")]),t._v(" "),s("div",{staticClass:"language-js extra-class"},[s("pre",{pre:!0,attrs:{class:"language-js"}},[s("code",[s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("sayHi")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" a "),s("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v('"a"')]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 在这里执行是，内部的 a 是可以访问到的")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token function"}},[t._v("sayHi")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n"),s("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// sayHi 执行完了，内部的 a 无法达到")]),t._v("\n")])])]),s("p",[t._v("优点：")]),t._v(" "),s("ol",[s("li",[t._v("可以解决循环引用；")])]),t._v(" "),s("p",[t._v("缺点：")]),t._v(" "),s("ol",[s("li",[t._v("空间碎片化，当回收的对象在地址上是不连续的，由于是不连续的，在垃圾回收后，空闲区域就会分散在各个角落。而在后续使用这些空闲区域时，如果大小刚好就能直接使用，如果大小不合适就不能使用了，造成了内存浪费；")]),t._v(" "),s("li",[t._v("在遍历的过程中即使发现了一个对象是不可达的，也不会立即去回收也要等到最后才去清除，并且当去清除的时候，程序是停止工作的。")])]),t._v(" "),s("h4",{attrs:{id:"标记整理"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#标记整理"}},[t._v("#")]),t._v(" 标记整理")]),t._v(" "),s("p",[t._v("可以理解为是标记清除的升级版，在清除阶段会先将对象进行整理，移动对象位置，然后成块的回收垃圾，解决空间碎片化的问题。")]),t._v(" "),s("h3",{attrs:{id:"v8-垃圾回收策略"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#v8-垃圾回收策略"}},[t._v("#")]),t._v(" v8 垃圾回收策略")]),t._v(" "),s("p",[t._v("采用分代回收的思想，将内存分为新生代和老生代。针对不同代采用不同算法。")]),t._v(" "),s("p",[t._v("新生代：复制算法，标记整理。")]),t._v(" "),s("ul",[s("li",[t._v("新生代内存 64 位系统下是 32M ,32 位系统下是 16M")]),t._v(" "),s("li",[t._v("空间复制的时候产生 From 和 To 二个等大小的空间，始终有一部分是空间不使用的，即使很小也是一种浪费，属于用空间换时间。")])]),t._v(" "),s("p",[t._v("老生代：标记清除，标记整理，增量标记。")]),t._v(" "),s("ul",[s("li",[t._v("老生代内存 64 位系统下是 1.4G ,32 位系统下是 700M")])]),t._v(" "),s("h4",{attrs:{id:"v8-为什么要限制内存大小"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#v8-为什么要限制内存大小"}},[t._v("#")]),t._v(" v8 为什么要限制内存大小")]),t._v(" "),s("ol",[s("li",[t._v("是因为对于浏览器来说这点内存给 js 运行已经非常足够。")]),t._v(" "),s("li",[t._v("耗时问题。以 1.5G 的垃圾回收的堆内存为例，V8 做一次小的垃圾回收需求 50ms 以上，而做一次非增量标记回收甚至需要 1s 以上，严重影响用户体验。")])]),t._v(" "),s("h3",{attrs:{id:"监控内存的几种方式"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#监控内存的几种方式"}},[t._v("#")]),t._v(" 监控内存的几种方式")]),t._v(" "),s("ol",[s("li",[t._v("浏览器任务管理器；")]),t._v(" "),s("li",[t._v("timeline 时序图记录；")]),t._v(" "),s("li",[t._v("堆快照查找分离 dom；")]),t._v(" "),s("li",[t._v("判断是否存在频繁的垃圾回收。")])]),t._v(" "),s("h4",{attrs:{id:"浏览器任务管理器"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#浏览器任务管理器"}},[t._v("#")]),t._v(" 浏览器任务管理器")]),t._v(" "),s("p",[t._v("浏览器任务管理器 主要查看两列内存，一列是 dom 内存，一列是 JavaScript 内存。查看 dom 内存变动可知当前页面 dom 节点是否在新增/删除。查看 JavaScript 内存可知是否有内存泄漏情况。")]),t._v(" "),s("h4",{attrs:{id:"timeline-时序图"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#timeline-时序图"}},[t._v("#")]),t._v(" timeline 时序图")]),t._v(" "),s("p",[t._v("就是性能标签里打开录制后的图形界面。")]),t._v(" "),s("h4",{attrs:{id:"堆快照查找分离-dom"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#堆快照查找分离-dom"}},[t._v("#")]),t._v(" 堆快照查找分离 dom")]),t._v(" "),s("p",[t._v("内存标签里的堆快照。在执行某些操作前，后各拍一次快照。然后通过搜索 detach 来查找是否有分离 dom。")]),t._v(" "),s("p",[t._v("分离 dom 就是一种内存泄漏。")]),t._v(" "),s("p",[t._v("分离状态的 dom：指的是不在界面上显示，也不在 dom 树上，但是还在被对象引用着的 dom 节点。")]),t._v(" "),s("h4",{attrs:{id:"gc-是否频繁的执行"}},[s("a",{staticClass:"header-anchor",attrs:{href:"#gc-是否频繁的执行"}},[t._v("#")]),t._v(" GC 是否频繁的执行")]),t._v(" "),s("p",[t._v("查看 timeline 中是否存在频繁的上升下降。查看任务管理器中内存数值是否频繁的增加减小。")])])}),[],!1,null,null,null);a.default=r.exports}}]);