// 归并排序
// 时间复杂度 O(nlogn)1·
// 空间复杂度 O(n)
// 递归版本

function mergeSort(list) {
  if (list.length < 2) {
    return list
  }
  const middle = Math.floor(list.length / 2)
  const l = list.slice(0, middle)
  const r = list.slice(middle, list.length)
  return merge(mergeSort(l), mergeSort(r))
}

function merge(l, r) {
  const res = []
  while (l.length && r.length) {
    if (l[0] < r[0]) {
      res.push(l.shift())
    } else {
      res.push(r.shift())
    }
  }
  while (l.length) {
    res.push(l.shift())
  }
  while (r.length) {
    res.push(r.shift())
  }
  return res
}

const list = [0, 31, 190, 123, 46, 459, 93, 497, 734, 350, 1, 10, 100, 1000, 22]
console.log(mergeSort(list))
