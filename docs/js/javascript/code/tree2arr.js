const tree = [
  {
    id: 1,
    text: '节点1',
    parentId: 0,
    children: [
      {
        id: 2,
        text: '节点1_1',
        parentId: 1
      }
    ]
  }
]

function tree2arr(tree, res = []) {
  tree.forEach((item) => {
    if (item.children) {
      tree2Arr(item.children, res)
      delete item.children
    }
    res.push(item)
  })
  return res
}

console.log(tree2arr(tree))
