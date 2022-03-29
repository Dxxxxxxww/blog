Function.prototype.bind2 = function (context) {
  if (typeof this !== 'function') {
    throw new Error('error')
  }

  const args = [].slice.apply(arguments, [1]),
    self = this

  const Fc = function () {}
  Fc.prototype = self.prototype

  const func = function () {
    const args2 = [].slice.apply(arguments)
    return self.apply(this instanceof func ? this : context, args.concat(args2))
  }
  // 继承一下，这样保证了原型链，又不会影响到父类的 prototype
  func.prototype = new Fc()
  return func
}

function say() {
  console.log(this.x)
}

var a = say.bind2({ x: 1 })
var b = a.bind2({ x: 2 })
b()

// bind 多次调用无效，是因为闭包保存了首次的入参。
// 这也是因为bind实际上是给原始函数封装了一层，原函数是以 首次入参为 this 来调用的。
// 多次 bind 只是多次封装，最终调用的函数还是原来的那个。
