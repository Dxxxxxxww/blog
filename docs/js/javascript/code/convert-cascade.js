// 利用引用的方法，将列表转换成级联

let list = [
  { id: 1, name: '部门A', parentId: 0 },
  { id: 2, name: '部门B', parentId: 0 },
  { id: 3, name: '部门C', parentId: 1 },
  { id: 4, name: '部门D', parentId: 1 },
  { id: 5, name: '部门E', parentId: 2 },
  { id: 6, name: '部门F', parentId: 3 },
  { id: 7, name: '部门G', parentId: 2 },
  { id: 8, name: '部门H', parentId: 4 }
]

const isObject = (o) =>
  (typeof o === 'object' || typeof o === 'function') && o !== null

function cloneDeep(target, map = new WeakMap()) {
  if (isObject(target)) {
    // 解决循环引用，用 weakmap 防止内存泄露
    if (map.get(target)) {
      return target
    }
    map.set(target, true)
    let cloneTarget
    if (Array.isArray(target)) {
      cloneTarget = []
      target.forEach((v, i) => {
        cloneTarget[i] = cloneDeep(v, map)
      })
    } else {
      cloneTarget = {}
      for (const key in target) {
        if (target.hasOwnProperty(key)) {
          cloneTarget[key] = cloneDeep(target[key], map)
        }
      }
    }
    return cloneTarget
  } else {
    return target
  }
}
// 2次遍历的方法
function convert2(list) {
  const _map = {}
  const res = []
  list.forEach((item) => {
    if (!_map[item.id]) {
      _map[item.id] = item
    }
  })
  // console.log(_map)

  list.forEach((item) => {
    if (item.parentId === 0) {
      res.push(item)
    } else {
      // 不需要这么麻烦的判断，如果在 _map 存在，那 parentId 一定是相等的
      // _map[item.parentId].id === item.parentId
      if (_map[item.parentId]) {
        _map[item.parentId].children = _map[item.parentId].children || []
        _map[item.parentId].children.push(item)
      }
    }
  })

  return res
}
// 单次遍历的方法
function convert(list) {
  // 存储父级的 map
  const _map = {}
  const res = []
  list.forEach((item) => {
    if (!_map[item.id]) {
      _map[item.id] = item
    } else {
      // 如果已经有了，可能是之前的循环时将父级存入的假的，把它变成真的
      _map[item.id].name = item.name
      _map[item.id].parentId = item.parentId
      // item = _map[item.id]
    }
    if (item.parentId === 0) {
      res.push(item)
    } else {
      const parentItem = _map[item.parentId]
      if (!parentItem) {
        // 取不到就先赋值一个假的
        _map[item.parentId] = {
          id: item.parentId
        }
      }
      parentItem.children = parentItem.children ?? []
      parentItem.children.push(item)
    }
  })
  return res
}

function convertAnswer(list) {
  const res = []
  const map = {}
  for (let item of list) {
    const cachedItem = map[item.id]
    // 这里是 id 相同则覆盖，因为下面会给父级先设置一个 id
    if (cachedItem) {
      cachedItem.name = item.name
      cachedItem.parentId = item.parentId
      item = cachedItem
    } else {
      map[item.id] = item
    }
    if (item.parentId === 0) {
      res.push(item)
    } else {
      let parent = map[item.parentId]
      if (!parent) {
        parent = {
          id: item.parentId
        }
        map[item.parentId] = parent
      }
      parent.children = parent.children || []
      parent.children.push(item)
    }
  }
  return res
}
// const result = convert(list)
const result = convert2(list)
// const result = convertAnswer(list)

console.log(result)
