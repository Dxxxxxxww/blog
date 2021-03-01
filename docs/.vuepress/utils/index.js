const fs = require('fs')
const path = require('path')
// process.cwd() 获取当前工作目录
const rootPath = process.cwd()

function requireChildren(folderName) {
  return fs
    .readdirSync(path.join(rootPath, `docs\/${folderName}`))
    .map((fileName) => `${folderName}\/${fileName.replace('.md', '')}`)
}

/**
 * @description 获取侧边栏
 * @returns {string[]}
 */
function requireSidebar() {
  // 获取指定目录下的文件，并返回文件名数组
  // path.join() 拼接路径
  // fs.readdirSync() 将返回一个包含“指定目录下所有文件名称”的数组对象。
  const folderList = fs
    .readdirSync(path.join(`${rootPath}\/docs`))
    .filter((fileName) => fileName.endsWith('-module'))

  function getSidebarName(folder) {
    const lastIndex = folder.lastIndexOf('-')
    return folder.slice(0, lastIndex)
  }

  return folderList.reduce(
    (result, folder) => (
      result.push({
        title: getSidebarName(folder),
        children: requireChildren(folder),
      }),
      result
    ),
    []
  )
}

// console.log(requireSidebar())
// [
//   { title: 'css', children: ['css-module/001'] },
//   { title: 'html', children: [] },
//   { title: 'js', children: [] },
//   { title: 'others', children: ['others-module/continued'] }
// ]

module.exports = {
  requireSidebar,
}

// require.context 原来是 webpack 的，一直以为是 node 的。汗
// const requireComponent = require.context(
//   // 其组件目录的相对路径
//   './components',
//   // 是否查询其子目录
//   false,
//   // 匹配基础组件文件名的正则表达式
//   /Base[A-Z]\w+\.(vue|js)$/
// )

// function getChildren(params) {}

// function requireSidebar(path, title, isDeep = false) {
//   const md = require.context(path, isDeep, /\.md/)
//   md.keys().forEach((fileName) => {
//     console.log(fileName)
//   })
// }
