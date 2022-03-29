// function b() {
//   console.log('b==', this)
// }
// b()
// module.exports = {
//   b
// }

// // ;(function a() {
// console.log('a==', this) // Object [global]
// function b() {
//   // 这个 this 指向哪里？
//   console.log('b==', this) // Object [global]
// }
// b()

// const c = () => {
//   console.log('c==', this) // Object [global]
// }
// c()
// // })()
module.exports.hello = 'world'
function b() {
  console.log(this) // global
  console.log(this === global) // true
  console.log(this.b) // undefined
}

b()

console.log(this.b) // undefined

console.log(this === module.exports) // true
console.log(this === global) // false
console.log(this) // { hello: 'world' }
