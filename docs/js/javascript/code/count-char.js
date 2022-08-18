/**
 * 实现 getFrequentChar 函数，返回一个数组，数组第0位是出现次数最多的字符，第1位是该字符的出现次数
 * //=> ['a', 6]
getFrequentChar("aaabbaaacc");

//=> ['a', 3]
getFrequentChar("aaa");
 */

function getFrequentChar(str) {
  const map = {}
  let res = ['', 0]
  const arr = str.split('')
  for (const val of arr) {
    if (!map[val]) {
      map[val] = 1
    } else {
      map[val]++
    }
  }
  for (const key in map) {
    if (map[key] > res[1]) {
      res[0] = key
      res[1] = map[key]
    }
  }
  return res
}

console.time()
console.log(getFrequentChar('aaabbaaacc'))
console.timeEnd()
console.time()
console.log(getFrequentChar('aaa'))
console.timeEnd()
