// 二分查找

function solution(isBadVersion, badVersion, n) {
  let left = 0,
    right = n
  while (left < right) {
    const mid = left + Math.floor((right - left) / 2)
    if (isBadVersion(badVersion, mid)) {
      right = mid
    } else {
      left = mid + 1
    }
  }
  // 最终结果 left === right 所以随便返回哪个都可以
  return left
}

function isBadVersion(badVersion, n) {
  return  n >= badVersion;
}

solution(isBadVersion, 4, 5)

// var solution = function(isBadVersion) {
//   /**
//    * @param {integer} n Total versions
//    * @return {integer} The first bad version
//    */
//   return function(n) {
//     let left = 0, right = n
//     while (left < right) {
//       const mid = left + Math.floor((right - left) / 2)
//       if (isBadVersion(mid)) {
//         right = mid
//       } else {
//         left = mid + 1
//       }
//     }
//     // 最终结果 left === right 所以随便返回哪个都可以
//     return left
//   };
// };
