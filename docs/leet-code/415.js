// 415. 字符串相加
const addStrings = (num1, num2) => {
  const zero = '0'.charCodeAt()
  let add = 0
  let l = num1.length - 1
  let r = num2.length - 1
  let sum = []
  while (l >= 0 || r >= 0 || add) {
    const n1 = l >= 0 ? num1[l].charCodeAt() - zero : 0
    const n2 = r >= 0 ? num2[r].charCodeAt() - zero : 0
    const curSum = n1 + n2 + add
    add = Math.floor(curSum / 10)
    sum.push(curSum % 10)
    l--
    r--
  }
  return sum.reverse().join('')
}

console.log(addStrings('11', '123'))
console.log(addStrings('456', '77'))
console.log(addStrings('0', '0'))
