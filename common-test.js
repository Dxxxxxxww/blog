// flatArray

function flatArray(arr, count) {
  if (!Array.isArray(arr)) return
  let _count = 0
  const dfs = (arr) => {
    let res = []
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (_count >= count) return res
      res = Array.isArray(item) ? res.concat(dfs(item)) : res.concat(item)
      // console.log(res)
    }
    // return arr.reduce((res, item) => {
    //   return Array.isArray(item) ? res.concat(dfs(item)) : res.concat(item)
    // }, [])
    return res
  }
  // dfs(arr)
  // return dfs(arr)
  return dfs(arr)
}

const arr = [' ', [' ', ' '], [' ', [' ', [' ']], ' ']]
flatArray(arr)
console.log(flatArray(arr))
// [" ", " ", " ", " ", [" ", [" "]], " "]

// console.log(flatArray(arr, 2))
// [" ", " ", " ", " ", " ", [" "], " "]
