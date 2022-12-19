// https://www.runoob.com/nodejs/nodejs-buffer.html
/* const b1 = Buffer.alloc(10) 申请缓冲区大小
const b2 = Buffer.allocUnsafe(10)

console.log(b1)
console.log(b2) */

// from 从字符串或者数组创建一个buffer，返回的是 十六进制形式的字节值
/* const b1 = Buffer.from('中') 
console.log(b1) */
// 数组中直接放中文是不行的，需要先将中文转成十六进制的值
// 数组中建议还是放数字，然后使用十进制，用别的进制容易转晕。。
// const b1 = Buffer.from([0xe4, 0xb8, 0xad]) // '中'
/* const b1 = Buffer.from([0x60, 0b1001, 12])
console.log(b1) 
console.log(b1.toString())  */
/* const b1 = Buffer.from('中')
console.log(b1)
console.log(b1.toString()) */

// 即便是用这种方式申请缓冲区，也不是同一片内存
const b1 = Buffer.alloc(3)
const b2 = Buffer.from(b1)

console.log(b1)
console.log(b2)

b1[0] = 1
console.log(b1)
console.log(b2)
