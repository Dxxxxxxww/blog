const str = '12345678'

// 完美答案
// 实现千位分隔符
function numFormat(str) {
    let decimals, minus
    if (str < 0) {
        minus = true
        str = str * -1
    }
    str = String(str)
    if (str.includes('.')) {
        ;[str, decimals] = str.split('.')
    }
    let res = reverseString(str).replace(/(\d{3})/g, ($1) => {
        return `${$1},`
    })
    if (res[res.length - 1] === ',') {
        res = res.slice(0, res.length - 1)
    }
    return decimals
        ? `${minus ? '-' : ''}${reverseString(res)}.${decimals}`
        : `${minus ? '-' : ''}${res}`
}

function reverseString(str) {
    return str.split('').reverse().join('')
}

console.log(numFormat(123456789.12345))
// 123,456,789.12345
console.log(numFormat(12345678.12345))
console.log(numFormat(1234567.12345))

console.log(numFormat(-123456789.12345))
// -123,456,789.12345

console.log(numFormat(0.12345))
// 0.12345


// 方法1，数字过大或者有小数点会有精度问题
// parseInt
parseFloat(str).toLocaleString()

parseInt(165067942591111111111111181).toLocaleString() // '1'
parseFloat(165067942591111111111111181).toLocaleString() // '165,067,942,591,111,100,000,000,000'

// 方法2 reduce + string 有缺陷，无法处理负数，无法处理 0.xxx
function formatCash(str) {
  return String(str)
    .split('')
    .reverse()
    .reduce((pre, next, index) => {
      return index % 3 ? next + '' + pre : next + ',' + pre
    })
}

// 方法3 reduce + arr，跟上面的一样，只不过 str 会重新开辟内存 有 bug 没输出出来
function f(str) {
  const ret = Array.from(str)
    .reverse()
    .reduce((result, next, i, arr) => {
      if ((i + 1) % 3 === 0 && i + 1 !== arr.length) {
        result.push(next, ',')
        return result
      }
      result.push(next)
      return result
    }, [])
  return ret.reverse().join('')
}

// 方法4，正则

var reg2 = /(?!^)(?=(\d{3})+$)/g
console.log(str2.replace(reg2, ','))
