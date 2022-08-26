// flatArray

function flatArray(arr, count = 1) {
  if (!Array.isArray(arr)) return
  let _count = 0
  const dfs = (arr) => {
    _count++
    let res = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (_count >= count) {
        res = res.concat(item)
      } else {
        if (Array.isArray(item)) {
          res = res.concat(dfs(item))
        } else {
          res = res.concat(item)
        }
      }
    }
    return res
  }
  return dfs(arr)
}

const arr = [' ', [' ', ' '], [' ', [' ', [' ']], ' ']]
// console.log(flatArray(arr))
// [" ", " ", " ", " ", [" ", [" "]], " "]
// console.log(flatArray(arr, 2))
// [" ", " ", " ", " ", " ", [" "], " "]

// function flatObject(obj) {
//   if (typeof obj !== 'object' || !obj) return
//   const res = {}
//   const dfs = (obj, key = '') => {
//     if (typeof obj === 'object') {
//       if (Array.isArray(obj)) {
//         obj.forEach((val, i) => {
//           dfs(val, `${key}[${i}]`)
//         })
//       } else {
//         for (const itemKey in obj) {
//           dfs(obj[itemKey], `${key ? key + '.' : ''}${itemKey}`)
//         }
//       }
//     } else {
//       res[key] = obj
//     }
//   }
//   dfs(obj)
//   return res
// }

function flatObject(obj) {
  const res = {}
  const dfs = (val, key = '') => {
    if (typeof val === 'object' && val) {
      if (Array.isArray(val)) {
        val.forEach((item, i) => {
          dfs(item, `${key}[${i}]`)
        })
      } else {
        for (const valKey in val) {
          dfs(val[valKey], `${key ? key + '.' : ''}${valKey}`)
        }
      }
    } else {
      res[key] = val
    }
  }
  dfs(obj)
  return res
}

const obj = {
  a: 1,
  b: [1, 2, { c: true }],
  c: { e: 2, f: 3 },
  g: null
}
console.log(flatObject(obj))
