(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{206:function(t,a,r){"use strict";r.r(a);var s=r(0),e=Object(s.a)({},(function(){var t=this,a=t.$createElement,r=t._self._c||a;return r("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[r("h1",{attrs:{id:"chrome-架构"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#chrome-架构"}},[t._v("#")]),t._v(" Chrome 架构")]),t._v(" "),r("h2",{attrs:{id:"◆-进程和线程"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#◆-进程和线程"}},[t._v("#")]),t._v(" ◆ 进程和线程")]),t._v(" "),r("h3",{attrs:{id:"什么是并行处理？"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#什么是并行处理？"}},[t._v("#")]),t._v(" 什么是并行处理？")]),t._v(" "),r("p",[t._v("要讲清进程和线程的关系，就要先说说并行处理。"),r("br"),t._v("\n计算机中的"),r("b",[t._v("并行处理")]),t._v("，就是指同一时刻处理多个任务。譬如在代码中：")]),t._v(" "),r("div",{staticClass:"language-js extra-class"},[r("pre",{pre:!0,attrs:{class:"language-js"}},[r("code",[r("span",{pre:!0,attrs:{class:"token constant"}},[t._v("A")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v("\n"),r("span",{pre:!0,attrs:{class:"token constant"}},[t._v("B")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token number"}},[t._v("20")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token operator"}},[t._v("/")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),t._v("\n"),r("span",{pre:!0,attrs:{class:"token constant"}},[t._v("C")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token number"}},[t._v("7")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token operator"}},[t._v("*")]),t._v(" "),r("span",{pre:!0,attrs:{class:"token number"}},[t._v("8")]),t._v("\n")])])]),r("p",[t._v("如果程序使用单线程，串行处理的话，就会按照顺序来执行这三行代码，而如果采用多线程进行并行处理，就只需要开三个线程同时处理这三行代码。")]),t._v(" "),r("p",[r("b",[t._v("因此，使用并行处理能大大提高性能。")])]),t._v(" "),r("h3",{attrs:{id:"线程，进程"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#线程，进程"}},[t._v("#")]),t._v(" 线程，进程")]),t._v(" "),r("p",[t._v("线程是不能单独存在的，它是由进程来启动和管理的。所以，线程是进程的子级。"),r("br"),t._v("\n而进程呢？它就是一个程序的运行实例。详细的解释就是，"),r("b",[t._v("启动一个程序时，操作系统会为该程序创建一块内存，用来存放代码、运行中的数据和一个执行任务的主线程，这样的运行环境就叫进程。")])]),t._v(" "),r("p",[r("img",{attrs:{src:"/browser/ddd.png",alt:"image"}})]),t._v(" "),r("h3",{attrs:{id:"进程与线程关系的四个特点"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#进程与线程关系的四个特点"}},[t._v("#")]),t._v(" 进程与线程关系的四个特点")]),t._v(" "),r("ol",[r("li",[t._v("进程中的任意一线程出错，都会导致整个进程崩溃；")]),t._v(" "),r("li",[t._v("线程之间共享进程的数据；")]),t._v(" "),r("li",[t._v("当进程关闭后，操作系统会回收进程所占用的内存（包括内存泄漏的）；")]),t._v(" "),r("li",[t._v("进程之间的内容相互隔离。（如果不同进程间需要通信，就需要用到IPC机制了）")])]),t._v(" "),r("h2",{attrs:{id:"chrome-的进程"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#chrome-的进程"}},[t._v("#")]),t._v(" Chrome 的进程")]),t._v(" "),r("p",[t._v("目前 chrome 主要包括以下5个进程：")]),t._v(" "),r("ol",[r("li",[t._v("浏览器进程：主要负责界面显示、用户交互、子进程管理、存储功能；")]),t._v(" "),r("li",[t._v("渲染进程：每个tab页都会有一个渲染进程，都是运行在沙箱环境，核心任务是讲H、C、J转换为用户可以交互的页面；")]),t._v(" "),r("li",[t._v("GPU 进程：初衷是为了实现 3D CSS 效果，随后UI页面都采用 GPU 来挥之，这使得 GPU 成为浏览器的普遍需求；")]),t._v(" "),r("li",[t._v("网络进程：主要负责页面的网络资源加载；")]),t._v(" "),r("li",[t._v("插件进程：主要负责插件运行。")])]),t._v(" "),r("h3",{attrs:{id:"目前-chrome-架构的优缺点"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#目前-chrome-架构的优缺点"}},[t._v("#")]),t._v(" 目前 chrome 架构的优缺点")]),t._v(" "),r("p",[t._v("优点：提升了浏览器的稳定性、流畅性、安全性")]),t._v(" "),r("p",[t._v("缺点：")]),t._v(" "),r("ol",[r("li",[r("b",[t._v("更高的资源占用。")]),t._v("每个进程都会包含公共基础结构的副本（如JS运行环境），这就会消耗更多的内存资源。")]),t._v(" "),r("li",[r("b",[t._v("更复杂的体系架构。")]),t._v("浏览器各模块间耦合性高、扩展性差。")])]),t._v(" "),r("h2",{attrs:{id:"未来的-chrome-架构"}},[r("a",{staticClass:"header-anchor",attrs:{href:"#未来的-chrome-架构"}},[t._v("#")]),t._v(" 未来的 chrome 架构")]),t._v(" "),r("p",[t._v("chrome 为了解决上述缺点，新设计了 chrome 的架构，既"),r("b",[t._v("面向服务的架构")]),t._v("。如图所示：")]),t._v(" "),r("p",[r("img",{attrs:{src:"/browser/nc.png",alt:"image"}})]),t._v(" "),r("p",[t._v("原来的各种模块会被重构成独立的服务(service)，每个服务都可以在独立的进程中运行，访问服务必须使用已定义的接口，通过 IPC 来通信。"),r("b",[t._v("从而构建一个更内聚、松耦合、易于维护和拓展的系统。")]),t._v("更好实现 Chrome 简单、稳定、高速、安全的目标。")]),t._v(" "),r("p",[t._v("chrome 还提供灵活的弹性架构，在强大性能设备上会以多进程的方式运行基础服务，但是如果在资源受限的设备上（如下图），chrome 会将很多服务整合到一个进程中，从而节省内存占用。")]),t._v(" "),r("p",[r("img",{attrs:{src:"/browser/tx.png",alt:"image"}})])])}),[],!1,null,null,null);a.default=e.exports}}]);