// 实现 new

function myNew(ctor, ...args) {
  // 建立原型链
  const obj = Object.create(ctor)
  const res = ctor.apply(obj, args)
  return typeof res === 'function' || typeof res === 'object' ? res : obj
}

// Object.create 的实现

function myObjectCreate(ctor) {
    const obj = {}
    Object.setPrototypeOf(obj, ctor)
    return obj
}

function A(age) {
    this.age = age
}

const a = myNew(A, 10)
console.log(a.name)
