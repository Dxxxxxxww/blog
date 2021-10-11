const getInfo = axios('/api/getInfo')
const timeout = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('timeout')), 5000)
})

Promise.race([getInfo, timeout])
  .then((val) => {
    console.log(val)
  })
  .catch((err) => {
    console.log(err)
  })
