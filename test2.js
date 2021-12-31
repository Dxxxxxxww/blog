function objectFactory(constructor) {
    // 建立中间对象
    const temp = function() {};
    // 获取原型
    temp.prototype = constructor.prototype;
    // 创建对象
    const obj = new temp();
    // 绑定属性
    const res = constructor.apply(
        obj,
        Array.prototype.slice.call(arguments, 1)
    );
    if (typeof res === "object" || typeof res === "function") {
        return res;
    }
    return obj;
}

function Foo(a) {
    this.a = a;
}

console.log(new Foo("123"));
console.log(objectFactory(Foo, "123"));