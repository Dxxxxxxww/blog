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

function convert2(list) {
  // 深拷贝一份 list
  list = cloneDeep(list)
  const _map = {}
  const res = []
  list.forEach((item) => {
    if (!_map[item.id]) {
      _map[item.id] = item
    }
  })

  // for (const id in _map) {
  //   const item = _map[id]
  //   if (item.parentId === 0) {
  //     res.push(item)
  //   } else {
  //     if (_map[item.parentId] === item.id) {
  //       _map[item.parentId].children = _map[item.parentId].children || []
  //       _map[item.parentId].children.push(item)
  //     }
  //   }
  // }
  list.forEach((item) => {
    if (item.parentId === 0) {
      res.push(item)
    } else {
      if (_map[item.parentId] === item.id) {
        _map[item.parentId].children = _map[item.parentId].children || []
        _map[item.parentId].children.push(item)
      }
    }
  })

  return res
}

function convert(list) {
  // 深拷贝一份 list
  list = cloneDeep(list)
  // 存储父级的 map
  const _map = {}
  const res = []
  list.forEach((item) => {
    if (!_map[item.id]) {
      _map[item.id] = item
    } else {
      // 如果已经有了，可能是之前的循环时将父级存入的
      _map[item.id].name = item.name
      _map[item.id].parentId = item.parentId
      // item = _map[item.id]
    }
    if (item.parentId === 0) {
      res.push(item)
    } else {
      const parentItem = _map[item.parentId]
      if (!parentItem) {
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
