/*
 * @lc app=leetcode.cn id=14 lang=javascript
 *
 * [14] 最长公共前缀
 */

// @lc code=start
/**
 * @param {string[]} strs
 * @return {string}
 */
var longestCommonPrefix = function (strs) {
  if (!strs.length) {
    return ''
  }
  const first = strs[0]
  let c, otherItem
  for (let i = 0; i < first.length; i++) {
    c = first[i]
    for (let j = 0; j < strs.length; j++) {
      otherItem = strs[j]
      if (i === otherItem.length || c !== otherItem.charAt(i)) {
        return first.slice(0, i)
      }
    }
  }
  return first
}
// @lc code=end
