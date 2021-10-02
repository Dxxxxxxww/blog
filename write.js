// function flowRight(...args) {
//   return function(value) {
//     return args.reverse().reduce((initVal, current) => {
//       return current(initVal)
//     }, value)
//   }
// }
const flowRight = (...args) => (value) =>
  args.reduce((initVal, current) => current(initVal), value)

const fi = (arr) => arr[0]
const re = (arr) => arr.reverse()
const tu = (str) => str.toUpperCase()

const a = ['t', 'r', 'y']

console.log(flowRight(re, fi, tu)(a))
