let list = [
  { id: 1, name: '部门 A', parentId: 0 },
  { id: 2, name: '部门 B', parentId: 0 },
  { id: 3, name: '部门 C', parentId: 1 },
  { id: 4, name: '部门 D', parentId: 1 },
  { id: 5, name: '部门 E', parentId: 2 },
  { id: 6, name: '部门 F', parentId: 3 },
  { id: 7, name: '部门 G', parentId: 2 },
  { id: 8, name: '部门 H', parentId: 4 }
]

function convert(list) {
  const _map = {}
  const res = []
  list.forEach((item) => {
    _map[item.id] = item
  })

  list.forEach((item) => {
    if (item.parentId === 0) {
      res.push(item)
    } else {
      const parentItem = _map[item.parentId]
      if (parentItem) {
        parentItem.children = parentItem.children ?? []
        parentItem.children.push(item)
      }
    }
  })

  return res
}

const result = convert(list)
console.log(result);
