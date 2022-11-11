function Parent() {
  this.title = 'parent'
}

Parent.prototype.say = function () {
  console.log(this.title)
}

function Child() {
  Parent.call(this)
  this.cTitle = 'child'
}

Child.prototype = Object.create(Parent.prototype)

function myObjectCreate(pt) {
  function tmp() {}
  tmp.prototype = pt
  return new tmp()
}

function myNew(c) {
  const obj = {}
  obj.__proto__ = Object.create(c.prototype)
//   Object.setPrototypeOf
  const res = c.call(obj)
  return typeof res === 'object' || typeof res === 'function' ? res : obj
}

console.log(new Child())
