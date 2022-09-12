function quickSort(list, i, j) {
  if (i > j) return
  let l = i,
    r = j
  const item = list[i]
  while (l < r) {
    // 从右往左找，找到比目标值小的，移动到左侧
    while (l < r && item < list[r]) {
      r--
    }
    // 找到了对应的  r 放到目标值的左侧，并且 l下标 移动到下一个值
    if (l < r) {
      list[l++] = list[r]
    }
    // 从左往右找，找到比目标值大的，移动到右侧
    while (l < r && item > list[l]) {
      l++
    }
    if (l < r) {
      list[r--] = list[l]
    }
  }
  list[l] = item
  quickSort(list, i, l - 1)
  quickSort(list, l + 1, j)
}

const list = []
for (let i = 0; i < 10; i++) {
  list.push(Math.floor(Math.random() * 100 * i))
}

console.log('list: ', list)
quickSort(list, 0, 9)
console.log(list)
