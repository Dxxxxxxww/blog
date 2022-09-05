// render / template 的实现

const template = '用户名：{{ user["name"] }}，用户ID: {{ user.id }}'

const data = {
  user: {
    id: 10086,
    name: '山月'
  }
}

function render(template, data) {
  const tagReg = /\{\{((?:.|\r?\n)+?)\}\}/g
  const propsReg = /\s*((\w+)\[\"?\'?(\w+)\"?\'?\]|(\w+)\.(\w+))\s*/
  return template.replace(tagReg, (...args) => {
    const [_, item]  = args
    // console.log(item)
    const [,,key1, val1, key2, val2] =  propsReg.exec(item)
    // console.log(key1, val1, key2, val2)
    if (key1) {
      if (val1) {
        return data[key1][val1]
      }
      return data[key1]
    } else if (key2) {
      if (val2) {
        return data[key2][val2]
      }
      return data[key2]
    }
  })
}

const result = render(template, data)
console.log(result)
