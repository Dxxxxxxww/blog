// 剑指 Offer 58 - II. 左旋转字符串
/**
 * @param {string} s
 * @param {number} n
 * @return {string}
 */
const reverseLeftWords = function(s, n) {
    let tmp = s.slice(0, n)
    return `${s.slice(n)}${tmp}`
};
