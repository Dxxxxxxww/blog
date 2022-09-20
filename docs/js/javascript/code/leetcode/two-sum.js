// 两数相加 1
const twoSum = function (nums, target) {
    const map = {}
    let tmp = 0,
        res = []
    for (let i = 0; i < nums.length; i++) {
        tmp = target - nums[i]
        if (typeof map[tmp] !== 'undefined') {
            return [i, map[tmp]]
        }
        map[nums[i]] = i
    }
}

console.log(twoSum([2, 7, 11, 15], 9))
console.log(twoSum([3,2,4], 6))
console.log(twoSum([3,3], 6))
