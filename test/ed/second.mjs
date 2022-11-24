// 导出的是引用， 500ms 后会改变
// export default function thing() {}

function thing() {}
// 这种方式导出的 thing 一直指向函数，不会改变。可以理解为导出了值
export default thing

setTimeout(() => {
  thing = 'changed'
}, 500)
