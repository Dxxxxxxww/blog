// 快排
// 时间复杂度 Ο(nlogn) - Ο(n2)
// 空间复杂度 O(1)
function quickSort(list, i, j) {
  if (i > j) return
  let l = i,
    r = j
  const item = list[l]
  while (l < r) {
    // 从右往左找，找到一个比基准值小的，放在左边
    while (l < r && item < list[r]) {
      r--
    }
    // 找到了就替换
    if (l < r) {
      list[l++] = list[r]
    }
    //  从左往右找，找到一个比基准值大的，放在右边
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
  return list
}

const list = [0, 31, 190, 123, 46, 459, 93, 497, 734, 350, 1, 10, 100, 1000, 22]
console.log(quickSort(list, 0, 14))
