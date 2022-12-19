import thing from './second.mjs'
setTimeout(() => {
  console.log(thing, typeof thing) // "changed"
}, 1000)
