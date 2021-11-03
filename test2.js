function* createIdMaker() {
  let i = 1
  while (true) {
    yield i++
  }
}
const sayHi = () => {
  let str = 'hello'
  console.log(str)
}

const c = createIdMaker()
console.log(c.next())
console.log(c.next())
// 这里执行完后，generator 函数会出栈，sayHi 会入栈。
sayHi()
console.log(c.next())
// 也就是说 generator 每 next 一次都会入栈执行，然后遇到 yield 暂停再出栈
sayHi()
console.log(c.next())
console.log(c.next())
