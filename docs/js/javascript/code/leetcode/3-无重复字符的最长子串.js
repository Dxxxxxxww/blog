/*
 * @lc app=leetcode.cn id=3 lang=javascript
 *
 * [3] 无重复字符的最长子串
 */

// @lc code=start
/**
 * @param {string} s
 * @return {number}
 */
var lengthOfLongestSubstring = function (s) {
  if (s.length < 2) {
    return s.length
  }
  let left = 0,
    right = 1,
    set = new Set(),
    res = 1
  set.add(s[0])
  while (right < s.length) {
    if (set.has(s[right])) {
      set.delete(s[left++])
    } else {
      res = Math.max(res, right - left + 1)
      set.add(s[right++])
    }
  }
  return res
}
// @lc code=end
