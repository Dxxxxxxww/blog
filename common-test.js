function MyInstanceof(obj, constructor) {
  const proto = Object.getPrototypeOf(obj)
  if (!proto) {
    return false
  }
  if (proto !== constructor.prototype) {
    return MyInstanceof(proto, constructor)
  }
  return true
}

function A() {}

const a = new A()
const c = ''

// console.log(MyInstanceof(a, A))
// console.log(MyInstanceof(c, A))
// console.log(a instanceof A)
// console.log(c instanceof A)
console.log(MyInstanceof(1, A))
console.log(MyInstanceof(1, A))
console.log(1 instanceof A)
console.log(1 instanceof A)