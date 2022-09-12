// 大数相加 leetcode 415
/**
 * @param {string} num1
 * @param {string} num2
 * @return {string}
 */
const addStrings = function (num1, num2) {
    let i = num1.length - 1,
        j = num2.length - 1,
        carryNum = 0,
        ni = 0,
        nj = 0,
        tmp = 0
    const res = []
    while (i >= 0 || j >= 0 || carryNum !== 0) {
        ni = num1[i] >>> 0 ?? 0
        nj = num2[j] >>> 0 ?? 0
        tmp = ni + nj + carryNum
        res.unshift(tmp % 10)
        carryNum = Math.floor(tmp / 10)
        i--
        j--
    }
    return res.join('')
}

console.log(addStrings('1', '9'))
