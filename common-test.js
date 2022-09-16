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

console.log(search([-1,0,3,5,9,12], 9))
