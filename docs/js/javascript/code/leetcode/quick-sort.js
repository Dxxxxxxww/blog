// 快排
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

const list = []
for (let i = 0; i < 10; i++) {
    list.push(Math.floor(Math.random() * 100 * i))
}

console.log('list: ', list)
console.log(quickSort(list, 0, 9))
