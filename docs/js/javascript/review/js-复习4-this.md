# this

## web 环境

### 普通函数

普通函数的 this 指向在函数调用时确定。独立调用，在非严格模式下 指向 window。严格模式下 this 指向 undefined。

普通函数作为对象方法调用，指向对象。

普通函数作为构造函数调用，this 指向实例。如果返回了新的对象，则指向新的对象。返回 null/undefined/基本类型值，不会改变 this 指向。

#### call/apply/bind

普通函数多次 call，apply，指向当时传递的 this。多次 bind 无效，this 指向第一次 bind 的值（原因是闭包，一直保存着第一次的 this）。

传递 null/undefined，指向 window。传递基本类型值，指向基本类型值包装后的对象。

### 箭头函数

箭头函数的 this 是在其声明时就确立的，this 指向父级作用域的 this。

#### call/apply/bind

箭头函数无法改变其 this 指向。

## node 环境

在 node 中，每个模块实际上是一个函数。我们所编写的代码，都是在这个函数内部运行的。所以在模块文件中直接打印 this，是打印的这个模块包裹函数的 this，也就是 module.exports。可以理解为模块包裹函数是 module.exports 的一个对象方法。

### 普通函数

普通函数独立调用，this 指向 global。

### 箭头函数

箭头函数的 this 指向模块包裹函数，也就是指向 module.exports
