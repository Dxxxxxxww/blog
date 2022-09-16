function quickSort(list, i, j) {
  if (i >= j) return
  let left = i,
    right = j,
    item = list[left]
  while (left < right) {
    while (left < right && item < list[right]) {
      right--
    }
    if (left < right) {
      list[left++] = list[right]
    }
    while (left < right && item > list[left]) {
      left++
    }
    if (left < right) {
      list[right--] = list[left]
    }
  }
  list[left] = item
  quickSort(list, i, left)
  quickSort(list, left + 1, j)
  return list
}
const list = []
for (let i = 0; i < 10; i++) {
  list.push(Math.floor(Math.random() * 100 * i))
}

console.log('list: ', list)
console.log(quickSort(list, 0, 9))
