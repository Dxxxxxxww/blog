function mergeArr(list1, list2) {
  list1 = list1.sort((a, b) => a - b)
  list2 = list2.sort((a, b) => a - b)
  if (!list1.length) return list2
  if (!list2.length) return list1
  const list = []
  let l1 = (l2 = 0)
  while (l1 < list1.length || l2 < list2.length) {
    const n1 = l1 < list1.length ? list1[l1] : Number.MAX_SAFE_INTEGER
    const n2 = l2 < list2.length ? list2[l2] : Number.MAX_SAFE_INTEGER
    if (n1 === n2) {
      list.push(n1)
      l1++
      l2++
    } else if (n1 < n2) {
      list.push(n1)
      l1++
    } else {
      list.push(n2)
      l2++
    }
  }
  return list
}
// 这里有点投机取巧，因为Object.keys遍历出来的，key类型为number的会自动排序
function mergeArr2(a, b) {
  const arrToMap = (arr) =>
    arr.reduce((res, item) => ((res[item] = (res[item] || 0) + 1), res), {})

  const mapA = arrToMap(a)
  const mapB = arrToMap([...a, ...b])
  return Object.keys(mapB).reduce((res, item) => {
    const valueA = mapA[item] || 0
    const length = mapB[item] - valueA > valueA ? mapB[item] - valueA : valueA
    return [...res, ...Array.from({ length }).fill(+item)]
  }, [])
}

console.log(mergeArr([1, 2, 100, 5, 5], [2, 2, 2, 5, 0]))
console.log(mergeArr2([1, 2, 100, 5, 5], [2, 2, 2, 5, 0]))
