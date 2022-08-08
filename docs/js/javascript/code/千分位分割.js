const str = '12345678'

// 方法1，数字过大或者有小数点会有精度问题
// parseInt
parseFloat(str).toLocaleString()

parseInt(165067942591111111111111181).toLocaleString() // '1'
parseFloat(165067942591111111111111181).toLocaleString() // '165,067,942,591,111,100,000,000,000'

// 方法2 reduce + string

function formatCash(str) {
  return String(str)
    .split('')
    .reverse()
    .reduce((pre, next, index) => {
      return index % 3 ? next + '' + pre : next + ',' + pre
    })
}

// 方法3 reduce + arr，跟上面的一样，只不过 str 会重新开辟内存
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
