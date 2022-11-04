// 冒泡排序, 相邻比较，数组有多长，就要比较多少轮
// 在完全有序的情况下，最好的时间复杂度是O(n)，只需要1次冒泡。而在极端情况完全逆序，时间复杂度为O(n^2).
// 空间复杂度 O(1)
function bubble(list) {
  const len = list.length
  for (let i = 0; i < len; i++) {
    for (let j = 0; j + 1 < len - i; j++) {
      if (list[j] > list[j + 1]) {
        ;[list[j + 1], list[j]] = [list[j], list[j + 1]]
      }
    }
  }
  return list
}

const list = [0, 31, 190, 123, 46, 459, 93, 497, 734, 350, 1, 10, 100, 1000, 22]
console.log(bubble(list))
