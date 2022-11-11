function reduce(arr, fn, init) {
  let i = init === undefined ? 1 : 0
  let current = init === undefined ? arr[0] : init
  for (; i < arr.length; i++) {
    next = arr[i]
    current = fn(current, next)
  }
  return current
}

const arr = [1, 2, 3, 4, 5, 6]

const res1 = arr.reduce((current, next) => {
  return (current += next)
})

const res2 = arr.reduce((current, next) => {
  return (current += next)
}, 7)

const res3 = reduce(arr, (current, next) => {
  return (current += next)
})

const res4 = reduce(
  arr,
  (current, next) => {
    return (current += next)
  },
  7
)

console.log(res1)
console.log(res2)
console.log(res3)
console.log(res4)
