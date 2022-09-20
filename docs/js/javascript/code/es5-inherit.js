// ES5 继承

function Parent(name) {
    this.name = name
}

Parent.prototype.sayMyName = function() {
    console.log(this.name)
}

function Child(name) {
    Parent.call(this, name)
}
// 普通组合继承，这里会让父类构造函数调用两次
// 并且父类实例上的实例属性也会成为子类的公共属性
// Child.prototype = new Parent()

// 这里使用寄生组合继承。也就是通过 Object.create 的方式来构造子类的原型
Child.prototype = Object.create(Parent.prototype)

// 手写 Object.create

function myObjectCreate(ptt) {
    function F() {}
    F.prototype = ptt
    return new F()
}

Child.prototype = myObjectCreate(Parent.prototype)
