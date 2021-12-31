(window.webpackJsonp=window.webpackJsonp||[]).push([[45],{245:function(t,s,a){"use strict";a.r(s);var n=a(0),r=Object(n.a)({},(function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("h1",{attrs:{id:"函数式编程-fp"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#函数式编程-fp"}},[t._v("#")]),t._v(" 函数式编程(FP)")]),t._v(" "),a("h2",{attrs:{id:"概念"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#概念"}},[t._v("#")]),t._v(" 概念")]),t._v(" "),a("p",[t._v("常用的编程范式有三种：")]),t._v(" "),a("ol",[a("li",[t._v("面向过程；")]),t._v(" "),a("li",[t._v("面向对象；")]),t._v(" "),a("li",[t._v("函数式。")])]),t._v(" "),a("p",[t._v("函数式讲述的事务与事务，对象与对象之间的联系/关系。这里的函数不是指代码中的方法，而是数学中的函数，是一种映射关系，运算方法。")]),t._v(" "),a("p",[t._v("举个简单的例子，我花 2.5 元去商店买快乐水。这里的输入就是"),a("b",[t._v("花 2.5 元")]),t._v("，输出就是"),a("b",[t._v("得到快乐水")]),t._v("，中间的联系就是"),a("b",[t._v("交易")]),t._v("。")]),t._v(" "),a("p",[t._v("说到函数式就不得不提一个与它息息相关的概念：纯函数。即"),a("b",[t._v("相同的输入总会得到相同的输出。且没有任何副作用。")])]),t._v(" "),a("p",[t._v("接着上面的例子并套用纯函数的概念来说，无论是谁去进行这个交易，花 2.5 元，都会得到快乐水。")]),t._v(" "),a("p",[t._v("纯函数的好处：")]),t._v(" "),a("ol",[a("li",[t._v("可缓存(相同的输入总是可以得到相同的输出，则可以把值缓存下来，lodash.memoize)；")]),t._v(" "),a("li",[t._v("方便测试。始终有输入，有输出；")]),t._v(" "),a("li",[t._v("并行代码。因为纯函数根本不需要访问共享的内存(比如说外部/全局变量，如果外部变量改变了，则纯函数内部因为依赖外部变量也会导致出现不同结果，就会不“纯”了。当然这里也可以使用科里化来解决。)，而且根据其定义，纯函数也不会因副作用而进入竞争态(race condition)。")])]),t._v(" "),a("p",[t._v("常见的会使函数变得不纯的来源：")]),t._v(" "),a("ol",[a("li",[t._v("外部变量(其实以下三种都是外部变量)；")]),t._v(" "),a("li",[t._v("配置文件；")]),t._v(" "),a("li",[t._v("数据库；")]),t._v(" "),a("li",[t._v("用户输入")])]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 面向过程")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" num1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" num2 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" sum "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" num1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" num2\nconsole"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("sum"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 3")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 面向对象")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("class")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Num")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("constructor")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("num1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("num "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" num1\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n  "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("add")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("num2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("return")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("num "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" num2\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" num1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("new")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token class-name"}},[t._v("Num")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" sum "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" num1"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("add")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\nconsole"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("sum"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 3")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("//  函数式")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function-variable function"}},[t._v("add")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("num1"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" num2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" num1 "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("+")]),t._v(" num2\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" sum "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("add")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\nconsole"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("sum"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 3")]),t._v("\n")])])]),a("h2",{attrs:{id:"函数相关概念"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#函数相关概念"}},[t._v("#")]),t._v(" 函数相关概念")]),t._v(" "),a("h3",{attrs:{id:"函数是一等公民"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#函数是一等公民"}},[t._v("#")]),t._v(" 函数是一等公民")]),t._v(" "),a("p",[t._v("函数是一等公民：函数也是对象的一种。函数可以当做变量，形参，返回值。")]),t._v(" "),a("hr"),t._v(" "),a("h3",{attrs:{id:"高阶函数"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#高阶函数"}},[t._v("#")]),t._v(" 高阶函数")]),t._v(" "),a("p",[t._v("高阶函数(HOF, higher-order-function)：函数可作为参数传递给另一个函数。函数可作为另一个函数的返回结果。可以用来屏蔽细节，只关注目的。例如：")]),t._v(" "),a("div",{staticClass:"language-js extra-class"},[a("pre",{pre:!0,attrs:{class:"language-js"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 面向过程")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" arr "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("3")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("4")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("6")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("for")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("let")]),t._v(" i "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("<")]),t._v(" arr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("length"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v(" i"),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("++")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("arr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("i"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("// 高阶函数，对于高阶函数来说，上面循环中的细节就不需要关心了")]),t._v("\narr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("forEach")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("item")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n  console"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("log")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v("item"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\narr"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),a("span",{pre:!0,attrs:{class:"token function"}},[t._v("filter")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),a("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("item")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" item "),a("span",{pre:!0,attrs:{class:"token operator"}},[t._v(">")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n")])])]),a("hr"),t._v(" "),a("h3",{attrs:{id:"闭包"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#闭包"}},[t._v("#")]),t._v(" 闭包")]),t._v(" "),a("p",[t._v("广义的闭包：当一个函数使用了不属于自身的自由变量(自由变量指在函数中使用的，但既不是函数参数也不是函数的局部变量的变量)。")]),t._v(" "),a("p",[t._v("狭义的闭包：即使创建它的上下文已经销毁，它仍然存在（比如，内部函数从父函数中返回）。并且在代码中引用了自由变量。")]),t._v(" "),a("h2",{attrs:{id:"其他概念"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#其他概念"}},[t._v("#")]),t._v(" 其他概念")]),t._v(" "),a("h3",{attrs:{id:"常用的函数式编程的库"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#常用的函数式编程的库"}},[t._v("#")]),t._v(" 常用的函数式编程的库")]),t._v(" "),a("p",[t._v("lodash.fp 等。")]),t._v(" "),a("hr"),t._v(" "),a("h3",{attrs:{id:"科里化"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#科里化"}},[t._v("#")]),t._v(" 科里化")]),t._v(" "),a("p",[t._v("科里化：是一种通过给一个函数传递较少参数，得到一个新的只需要传递剩余参数的函数。")]),t._v(" "),a("p",[t._v("它可以让某些常用/基本不变的参数缓存下来，让函数变的更灵活，颗粒度更细小，即将多元函数变为一元函数。科里化是闭包的一种运用。")]),t._v(" "),a("p",[t._v("案例可参考[其他手写]一章中的 lodash.curry")]),t._v(" "),a("hr"),t._v(" "),a("h3",{attrs:{id:"函数组合"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#函数组合"}},[t._v("#")]),t._v(" 函数组合")]),t._v(" "),a("p",[t._v("函数组合：函数洋葱调用的封装。是一种关注点分离的编程方式(point free)。")]),t._v(" "),a("p",[t._v("a(b(c())) ==> compose(a, b, c)()")]),t._v(" "),a("p",[t._v("函数洋葱调用： a(b(c()))。")]),t._v(" "),a("p",[t._v("函数组合需要满足结合律，即：\ncompose(a, b, c), compose(compose(a, b), c), compose(a, compose(b, c)), 结果相同。")]),t._v(" "),a("p",[t._v("它的特点是：")]),t._v(" "),a("ol",[a("li",[t._v("不需要指明处理的数据，只要合成运算的过程；")]),t._v(" "),a("li",[t._v("需要定义一些辅助函数。")])]),t._v(" "),a("p",[t._v("案例可参考[其他手写]一章中的 lodash.flowRight lodash.flow")]),t._v(" "),a("hr"),t._v(" "),a("h3",{attrs:{id:"函子-functor"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#函子-functor"}},[t._v("#")]),t._v(" 函子 Functor")]),t._v(" "),a("p",[t._v("函子将单独开设一章来讲。")])])}),[],!1,null,null,null);s.default=r.exports}}]);