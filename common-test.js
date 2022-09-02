// 深拷贝
function cloneDeep(target, map = new WeakMap()) {
  let res
  if (target === null || target === undefined) {
    return target
  }
  if (Object(target) === target) {
    if (map[target]) {
        return target
    }
    map.set(target, true)
    res = []
    if (Array.isArray(target)) {
      target.forEach((val, index) => {
        res = res.concat(cloneDeep(val))
      })
      return res
    } else {
      res = {}
      for (const targetKey in target) {
        if (Object.hasOwnProperty.call(target, targetKey)) {
          res[targetKey] = cloneDeep(target[targetKey])
        }
      }
      return res
    }
  } else {
    return target
  }
}

const a = { a: 1, b: { c: '2', d: [3] } }
const b = cloneDeep(a)
console.log(b, a === b)


// function Person(name) {
//   this.name = name;
// }
//
// const person = new Person('test');
//
// function fn() {
//   console.log('3');
// }
// let xx = Symbol('xx')
//
// let obj = { y: 3 }
//
// let oldObj = {
//   fn: fn,
//   regexp: new RegExp('ab+c', 'gi'),
//   // undefined: person,
//   date: new Date(),
//   mum: 10,
//   bool: true,
//   str: '3',
//   // null: null,
//   // undefined: undefined,
//   // symbol: Symbol(123),
//   // [xx]: 5,
//   array: [1, 3, 4, [2, 4]],
//   // set: new Set([2, 3, 43, 6546, '2'])
// }
// oldObj.b = oldObj
// oldObj.map = new Map([[1, oldObj]])
// oldObj.__proto__ = obj
//
// const newObj = cloneDeep(oldObj)
//
// console.log(newObj, oldObj === newObj)
