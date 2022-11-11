// 基于原型链的污染攻击
// 原理就是通过 {}.constructor.prototype 获取到对象构造函数的原型，也就是 Object.prototype, 再在上面挂载。
function merge(target, source) {
  for (let key in source) {
    if (key in source && key in target) {
      merge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
}

const a = { constructor: { prototype: { hello: 1 } } }

let testObj = a // JSON.parse('{"constructor": {"prototype": {"hello": 1}}}')
merge({}, testObj)

let innocentObj = {}
innocentObj.hello // 1

console.log(innocentObj.hello)
