// 数组拍平
// 第二种需要把 res 放在外面
// let res = []
function flat(array) {
  // 第一种
  // let res = []
  // for (const item of array) {
  //   if (Array.isArray(item)) {
  //     res = res.concat(flat(item))
  //   } else {
  //     res.push(item)
  //   }
  // }
  // 第二种 要把 res 放在函数外面
  // for (const item of array) {
  //   if (Array.isArray(item)) {
  //     flat(item)
  //   } else {
  //     res.push(item)
  //   }
  // }
  // return res
  return array.reduce((res, item) => {
    // 第三种
    // if (Array.isArray(item)) {
    //   res = res.concat(flat(item))
    // } else {
    //   res.push(item)
    // }
    // return res
    // 第四种
    return Array.isArray(item) ? res.concat(flat(item)) : res.concat(item)
  }, [])
}

const arr = [1, 2, 3, [4, 5, [6]]]

// 方法1
function flat1(array) {
  let res = []
  for (let i = 0; i < array.length; i++) {
    const item = array[i]
    if (Array.isArray(item)) {
      res = res.concat(flat1(item))
    } else {
      res.push(item)
    }
  }
  return res
}

console.log(flat1(arr))

// 方法2
let res = []
function flat2(array) {
  for (let i = 0; i < array.length; i++) {
    const item = array[i]
    if (Array.isArray(item)) {
      flat2(item)
    } else {
      res.push(item)
    }
  }
}
flat2(arr)
console.log(res)

// 方法3
function flat3(array) {
  return array.reduce(
    (res, item) =>
      Array.isArray(item) ? res.concat(flat3(item)) : res.concat(item),
    []
  )
}

console.log(flat3(arr))

// 方法4
function flat4(array) {
  while (array.some(Array.isArray())) {
    array = [].concat(...array)
  }
  return array
}

const flat = (arr) => {
  return arr.reduce((pre, cur) => {
    return pre.concat(Array.isArray(cur) ? flat(cur) : cur)
  }, [])
}



// 带控制的 flat array
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
