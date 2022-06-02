// 数组拍平
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
  // return res
  return array.reduce((res, item) => {
    // 第二种
    // if (Array.isArray(item)) {
    //   res = res.concat(flat(item))
    // } else {
    //   res.push(item)
    // }
    // return res
    // 第三种
    return Array.isArray(item) ? res.concat(flat(item)) : res.concat(item)
  }, [])
}

const arr = [1, 2, 3, [4, 5, [6]]]

console.log(flat(arr))

// https://juejin.cn/post/6844904025993773063#heading-9
