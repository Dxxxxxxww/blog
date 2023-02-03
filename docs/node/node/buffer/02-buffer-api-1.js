// 常用实例方法 https://www.runoob.com/nodejs/nodejs-buffer.html
let buf = Buffer.alloc(6)

// fill 使用数据填充 buffer
/* buf.fill(123)
console.log(buf)
console.log(buf.toString()) */

// write 向 buffer 中写入数据
/* buf.write('123', 1, 4)
console.log(buf)
console.log(buf.toString()) */

// toString 从 buffer 中提取数据
/* buf = Buffer.from('发财')
console.log(buf)
console.log(buf.toString('utf-8', 3, 9)) */

// slice 截取 buffer
/* buf = Buffer.from('发财')
let b1 = buf.slice(-3)
console.log(b1)
console.log(b1.toString()) */

// indexOf 在 buffer 中查找数据
/* buf = Buffer.from('dx爱前端，爱发财，爱大家，我爱所有')
console.log(buf)
console.log(buf.indexOf('爱qc', 4)) */

// copy 拷贝，调用者是被拷贝对象，第一个参数是目标值
let b1 = Buffer.alloc(6)
let b2 = Buffer.from('发财')
// 把 b2 拷贝到 b1 上
b2.copy(b1, 3, 3, 6)
console.log(b1.toString())
console.log(b2.toString())
