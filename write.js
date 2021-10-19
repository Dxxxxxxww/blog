const p = new Promise((resolve, reject) => {
  resolve(123)
})

p.then(() => {
  throw new Error('abc')
}).catch(err => {
  console.log(err)
})
