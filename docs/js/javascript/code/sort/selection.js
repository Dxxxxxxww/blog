// 选择排序 O(n²) 在未排序中，选择最小值放到已排序的那侧
// 空间复杂度 O(1)
function selection(list) {
  const len = list.length
  let minIndex
  for (let i = 0; i < len - 1; i++) {
    minIndex = i
    for (let j = i + 1; j < len; j++) {
      if (list[minIndex] > list[j]) {
        minIndex = j
      }
    }
    ;[list[minIndex], list[i]] = [list[i], list[minIndex]]
  }
  return list
}

const list = [0, 31, 190, 123, 46, 459, 93, 497, 734, 350, 1, 10, 100, 1000, 22]
console.log(selection(list))
