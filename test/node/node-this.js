// // const moduleB = require('./b')

// // // const { b } = require('./b')

// // function a() {
// //   console.log('a===', this)
// // }

// // a()
// // moduleB.b() // this 指向 moduleB
// // // b() // this 指向 global

// // const c = () => {
// //   console.log('c===', this)
// // }

// // c()
// // console.log('global====', this)
// // console.log(this.setInterval)
// // console.log(setInterval)

// module.exports = { hello: 'world' }
console.log('global===', this) // {}

// 如果说 global 是全局对象，然后 node 包裹层函数的 this 是 {} 的话，那么上面打印 this，箭头函数的 this 是{} 是没问题的。这样的话，b作为独立调用的函数，它的 this 指向 global。也是没问题的。但是为什么global 上面缺没有挂载 b？没有问题，node就是这么设计的。
//
function b() {
  // console.log('b===', this) // Object [global]
  console.log('b===', this) // Object [global]
  console.log('this.b===', this.b) // undefined
  console.log('global.b===', global.b) // undefined
}
b()
console.log('global.b+++', global.b) // undefined

const c = () => {
  console.log('c===', this) // {}
}
c()

// {} 对象上确实没有 setInterval 这是正常的
console.log('this.setInterval ===', this.setInterval) // undefined
// 这里会去 global 上取
console.log('setInterval===', setInterval) // [Function: setInterval]

// b2 作为独立调用的函数， this 指向 global ，this.setInterval 也是能获取到的
function b2() {
  console.log('b2===', this.setInterval) // [Function: setInterval]
}
b2()

const c2 = () => {
  console.log('c2===', this.setInterval) // undefined
}
c2()

// function fn() {
//   this.num = 10
// }
// fn()
// console.log(this)
// console.log(this.num)
// console.log(global.num)
