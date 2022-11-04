// 插入排序
// 时间复杂度 O(n²)
// 空间复杂度 O(1)
function insertSort(list) {
  let preIndex, current
  for (let i = 1; i < list.length; i++) {
    preIndex = i - 1
    current = list[i]
    while (preIndex >= 0 && list[preIndex] > current) {
      list[preIndex + 1] = list[preIndex]
      preIndex--
    }
    list[preIndex + 1] = current
  }
  return list
}

const list = [0, 31, 190, 123, 46, 459, 93, 497, 734, 350, 1, 10, 100, 1000, 22]
console.log(insertSort(list))
