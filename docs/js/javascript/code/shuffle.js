// 洗牌算法

// 洗牌
function shuffle(arr) {
  const list = arr.slice(0)
  let randomOddItem
  if (list.length % 2 === 1) {
    randomOddItem = list.splice(Math.floor(Math.random() * list.length), 1)[0]
  }
  const half = list.length / 2
  let halfLength = half
  // 分组
  while (halfLength) {
    let i = Math.floor(Math.random() * half)
    ;[list[i], list[i + half]] = [list[i + half], list[i]]
    halfLength--
  }
  // 不分组
  // let length = list.length
  // while (length) {
  //   let i = Math.floor(Math.random() * half)
  //   ;[list[length - 1], list[i]] = [list[i], list[length - 1]]
  //   length--
  // }
  if (randomOddItem) {
    list.splice(Math.floor(Math.random() * half), 0, randomOddItem)
  }
  return list
}

console.log(shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]))


// Fisher-Yates
// 时间复杂度 O(n^2)
// 空间复杂度 O(n)
function shuffle(arr) {
  const result = []
  while(arr.length) {
    // random = Math.floor(Math.random() * arr.length)
    const index = Math.random() * arr.length >>> 0
    result.push(arr[index])
    arr.splice(index, 1)
  }
  return result
}

// Knuth-Durstenfeld Shuffle
// 时间复杂度 O(n)
// 空间复杂度 O(1)
function shuffle(arr) {
  let length = arr.length
  while(length) {
    const index = Math.random() * length >>> 0
    length--
    const temp = arr[length]
    arr[length] = arr[index]
    arr[index] = temp
  }
}

function shuffleES6(arr) {
  let length = arr.length
  while(length) {
    const index = (Math.random() * length--) >>> 0;
        [arr[length], arr[index]] = [arr[index], arr[length]]
  }
  return arr
}
