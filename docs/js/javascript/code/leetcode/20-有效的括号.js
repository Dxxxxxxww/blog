/*
 * @lc app=leetcode.cn id=20 lang=javascript
 *
 * [20] 有效的括号
 */

// @lc code=start
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function (s) {
  const map = {
    ')': '(',
    ']': '[',
    '}': '{'
  }
  const stack = []
  for (const c of s) {
    if (map[c]) {
      const p = stack.pop()
      // 处理这种类似情况 '(]' ']('
      if (p !== map[c]) {
        return false
      }
    } else {
      stack.push(c)
    }
  }
  return !stack.length
}
// @lc code=end
