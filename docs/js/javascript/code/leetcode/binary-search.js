// 二分查找 lc 704

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
var search = function(nums, target) {
  let left = 0 , right = nums.length, mid = 0
  while(left < right) {
    mid = left + Math.floor((right - left) / 2)
    if (nums[mid] < target) {
      left = mid + 1
    } else if (nums[mid] > target) {
      right = mid
    } else {
      return mid
    }
  }
  return -1
};

// 二分查找 leetcode 278

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
