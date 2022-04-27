const o = {}
console.log('o的proto', Object.prototype.toString.call(o.__proto__))

function merge(target, source) {
  debugger
  for (let key in source) {
    if (key in source && key in target) {
      merge(target[key], source[key])
    } else {
      target[key] = source[key]
    }
  }
}

// constructor -> 通过原型对象拿到构造函数 Object()。prototype -> 通过构造函数 Object() 拿到其原型对象。
// 这样就在所有对象"祖级"原型上添加了属性。
let testObj = JSON.parse('{"constructor": {"prototype": {"hello": 1}}}')
// let testObj = JSON.parse('{"__proto__": {"hello": 1}}')
merge({}, testObj)

let innocentObj = {}
innocentObj.hello // 1
